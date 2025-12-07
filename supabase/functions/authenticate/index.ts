import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Admin credentials stored securely in environment
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'admin@torogil.com';
const ADMIN_PASSWORD = Deno.env.get('ADMIN_PASSWORD');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, clientName } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if this is admin login
    if (email === ADMIN_EMAIL) {
      if (!ADMIN_PASSWORD) {
        console.error('ADMIN_PASSWORD not configured');
        return new Response(
          JSON.stringify({ error: 'Server configuration error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (password !== ADMIN_PASSWORD) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Try to sign in admin, or create if doesn't exist
      let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      });

      if (signInError && signInError.message.includes('Invalid login credentials')) {
        // Create admin user
        const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          email_confirm: true,
        });

        if (signUpError) {
          console.error('Error creating admin:', signUpError);
          return new Response(
            JSON.stringify({ error: 'Failed to create admin account' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Assign admin role
        await supabase.from('user_roles').insert({
          user_id: signUpData.user.id,
          role: 'admin',
        });

        // Sign in again
        const { data: newSignIn, error: newSignInError } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
        });

        if (newSignInError) {
          return new Response(
            JSON.stringify({ error: 'Failed to sign in' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        signInData = newSignIn;
      } else if (signInError) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          session: signInData.session,
          user: signInData.user,
          role: 'admin',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Client authentication - validate against Google Sheets
    if (!clientName) {
      return new Response(
        JSON.stringify({ error: 'Client name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch and validate against Google Sheets
    const apiKey = Deno.env.get('GOOGLE_SHEETS_API_KEY');
    if (!apiKey) {
      console.error('GOOGLE_SHEETS_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sheetId = '1fu1vPM-vq6-Ff3tBIq_bcZrrW4fTX2T15BLi5d2bGwY';
    const range = 'A:B';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

    console.log('Validating client credentials...');
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Google Sheets API error:', await response.text());
      return new Response(
        JSON.stringify({ error: 'Failed to validate credentials' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const rows = data.values || [];

    // Skip header row and find matching client
    const validClient = rows
      .slice(1)
      .find((row: string[]) => {
        const name = (row[0] || '').trim();
        const pwd = (row[1] || '').trim();
        return name === clientName && pwd === password;
      });

    if (!validClient) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Client is valid - create or sign in Supabase user
    // Use a sanitized email format based on client name
    const clientEmail = `${clientName.toLowerCase().replace(/[^a-z0-9]/g, '_')}@client.torogil.local`;

    // Try to sign in existing user
    let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: clientEmail,
      password: password,
    });

    if (signInError && signInError.message.includes('Invalid login credentials')) {
      // Check if user exists with different password - update it
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === clientEmail);

      if (existingUser) {
        // Update password
        await supabase.auth.admin.updateUserById(existingUser.id, {
          password: password,
        });

        // Sign in with new password
        const { data: newSignIn, error: newError } = await supabase.auth.signInWithPassword({
          email: clientEmail,
          password: password,
        });

        if (newError) {
          console.error('Error signing in after password update:', newError);
          return new Response(
            JSON.stringify({ error: 'Failed to authenticate' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        signInData = newSignIn;
      } else {
        // Create new user
        const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
          email: clientEmail,
          password: password,
          email_confirm: true,
        });

        if (signUpError) {
          console.error('Error creating client user:', signUpError);
          return new Response(
            JSON.stringify({ error: 'Failed to create account' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Assign client role with client_name
        await supabase.from('user_roles').insert({
          user_id: signUpData.user.id,
          role: 'client',
          client_name: clientName,
        });

        // Sign in
        const { data: newSignIn, error: newSignInError } = await supabase.auth.signInWithPassword({
          email: clientEmail,
          password: password,
        });

        if (newSignInError) {
          return new Response(
            JSON.stringify({ error: 'Failed to sign in' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        signInData = newSignIn;
      }
    } else if (signInError) {
      console.error('Sign in error:', signInError);
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ensure client role exists
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', signInData!.user!.id)
      .eq('role', 'client')
      .maybeSingle();

    if (!roleData) {
      await supabase.from('user_roles').insert({
        user_id: signInData!.user!.id,
        role: 'client',
        client_name: clientName,
      });
    }

    console.log('Client authenticated successfully:', clientName);

    return new Response(
      JSON.stringify({
        session: signInData!.session,
        user: signInData!.user,
        role: 'client',
        clientName: clientName,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in authenticate function:', errorMessage);
    return new Response(
      JSON.stringify({ error: 'Authentication failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

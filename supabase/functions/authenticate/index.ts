import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_USERNAME = 'Felix Manuel Toro Gil';
const ADMIN_EMAIL = 'admin@torogil.local';
const ADMIN_PASSWORD = Deno.env.get('ADMIN_PASSWORD');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, clientName } = await req.json();
    console.log('Auth request for:', clientName || email);

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const isAdminLogin = clientName === ADMIN_USERNAME || email === ADMIN_EMAIL;
    
    if (isAdminLogin) {
      console.log('Admin login attempt');
      
      if (!ADMIN_PASSWORD) {
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

      let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      });

      if (signInError && signInError.message.includes('Invalid login credentials')) {
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

        await supabase.from('user_roles').insert({
          user_id: signUpData.user.id,
          role: 'admin',
        });

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

      // Ensure admin role exists (prevents redirect loops after login)
      if (signInData?.user?.id) {
        const adminUserId = signInData.user.id;
        const { data: existingAdminRole, error: adminRoleCheckError } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', adminUserId)
          .eq('role', 'admin')
          .maybeSingle();

        if (adminRoleCheckError) {
          console.error('Error checking admin role:', adminRoleCheckError);
        } else if (!existingAdminRole) {
          const { error: adminRoleInsertError } = await supabase.from('user_roles').insert({
            user_id: adminUserId,
            role: 'admin',
          });
          if (adminRoleInsertError) {
            console.error('Error creating admin role:', adminRoleInsertError);
          }
        }
      }

      console.log('Admin authenticated successfully');
      return new Response(
        JSON.stringify({
          session: signInData.session,
          user: signInData.user,
          role: 'admin',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Client authentication
    if (!clientName) {
      return new Response(
        JSON.stringify({ error: 'Client name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('GOOGLE_SHEETS_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sheetId = '1fu1vPM-vq6-Ff3tBIq_bcZrrW4fTX2T15BLi5d2bGwY';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A:B?key=${apiKey}`;

    console.log('Validating client credentials...');
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Google Sheets API error');
      return new Response(
        JSON.stringify({ error: 'Failed to validate credentials' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const rows = data.values || [];

    const validClient = rows.slice(1).find((row: string[]) => {
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

    console.log('Client validated, proceeding with auth:', clientName);

    const clientEmail = `${clientName.toLowerCase().replace(/[^a-z0-9]/g, '_')}@client.torogil.local`;

    // Try sign in first
    let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: clientEmail,
      password: password,
    });

    if (signInError) {
      console.log('Sign in failed, creating or updating user...');
      
      // Try to create user
      const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
        email: clientEmail,
        password: password,
        email_confirm: true,
      });

      if (signUpError) {
        // User exists - look up by client_name and update password
        if (signUpError.message.includes('already') || signUpError.message.includes('exists')) {
          console.log('User exists, finding user_id...');
          
          const { data: roleInfo } = await supabase
            .from('user_roles')
            .select('user_id')
            .eq('client_name', clientName)
            .eq('role', 'client')
            .maybeSingle();

          if (roleInfo?.user_id) {
            await supabase.auth.admin.updateUserById(roleInfo.user_id, { password });
            
            const { data: retrySignIn, error: retryError } = await supabase.auth.signInWithPassword({
              email: clientEmail,
              password: password,
            });

            if (retryError) {
              console.error('Error signing in after update:', retryError);
              return new Response(
                JSON.stringify({ error: 'Failed to authenticate' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
            signInData = retrySignIn;
          } else {
            console.error('User exists but no role found');
            return new Response(
              JSON.stringify({ error: 'Account configuration error' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } else {
          console.error('Error creating user:', signUpError);
          return new Response(
            JSON.stringify({ error: 'Failed to create account' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        // New user created
        console.log('New user created:', clientName);
        
        await supabase.from('user_roles').insert({
          user_id: signUpData.user.id,
          role: 'client',
          client_name: clientName,
        });

        // Create default folders
        await supabase.rpc('create_default_folders_for_client', { _client_name: clientName });

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
    }

    // Ensure role exists
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

    console.log('Client authenticated:', clientName);

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
    console.error('Auth error:', errorMessage);
    return new Response(
      JSON.stringify({ error: 'Authentication failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

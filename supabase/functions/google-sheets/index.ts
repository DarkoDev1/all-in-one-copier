import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_SHEETS_API_KEY');
    if (!apiKey) {
      console.error('GOOGLE_SHEETS_API_KEY not configured');
      throw new Error('Google Sheets API key not configured');
    }

    // Sheet ID from the URL provided
    const sheetId = '1fu1vPM-vq6-Ff3tBIq_bcZrrW4fTX2T15BLi5d2bGwY';
    const range = 'A:B'; // Assuming columns A and B have name and password
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
    
    console.log('Fetching data from Google Sheets...');
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Sheets API error:', errorText);
      throw new Error(`Failed to fetch sheet data: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Sheet data fetched successfully, rows:', data.values?.length || 0);
    
    // Parse the data - skip header row if exists
    const rows = data.values || [];
    const clients = rows.slice(1).map((row: string[]) => ({
      name: row[0] || '',
      password: row[1] || '',
    })).filter((client: { name: string; password: string }) => client.name && client.password);
    
    console.log('Parsed clients count:', clients.length);
    
    return new Response(
      JSON.stringify({ clients }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in google-sheets function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

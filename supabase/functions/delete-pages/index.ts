import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get page IDs for the routes to delete
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('id')
      .in('route', ['/skills', '/approvals', '/skill-explorer', '/projects']);

    if (pagesError) throw pagesError;

    const pageIds = pages?.map(p => p.id) || [];

    if (pageIds.length > 0) {
      // Delete page_access records
      const { error: accessError } = await supabase
        .from('page_access')
        .delete()
        .in('page_id', pageIds);

      if (accessError) throw accessError;

      // Delete pages
      const { error: deleteError } = await supabase
        .from('pages')
        .delete()
        .in('route', ['/skills', '/approvals', '/skill-explorer', '/projects']);

      if (deleteError) throw deleteError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Pages deleted successfully',
        deletedCount: pageIds.length 
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

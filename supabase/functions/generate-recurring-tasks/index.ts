// OPTIONAL Edge Function.
//
// The app already calls generate_due_recurring_tasks(business_id) lazily
// every time an owner or employee dashboard loads, so recurring tasks work
// correctly even without this function. This function exists only so you
// can ALSO run generation on a schedule (e.g. via Supabase's built-in
// Cron Triggers UI, which is free) so tasks appear even if nobody has
// opened the app yet that day. This is optional — skip it if you want the
// simplest possible setup.
//
// Deploy: supabase functions deploy generate-recurring-tasks
// Schedule: Supabase Dashboard -> Edge Functions -> generate-recurring-tasks
//           -> Cron -> e.g. "0 1 * * *" (01:00 UTC daily)

import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  // The service_role key is injected automatically by Supabase into every
  // Edge Function's environment — it is NEVER placed in frontend code.
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, serviceKey)

  const { data: businesses, error } = await supabase.from('businesses').select('id')
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  let totalGenerated = 0
  for (const b of businesses ?? []) {
    const { data, error: genErr } = await supabase.rpc('generate_due_recurring_tasks', {
      p_business_id: b.id
    })
    if (!genErr && typeof data === 'number') totalGenerated += data
  }

  return new Response(JSON.stringify({ ok: true, generated: totalGenerated }), {
    headers: { 'Content-Type': 'application/json' }
  })
})

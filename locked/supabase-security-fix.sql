-- LOCKED — Supabase security hardening
-- Fixes every finding from `get_advisors(security)` on project fwimdnukebbrwpwdyjbv.
-- Apply from Supabase Dashboard → SQL Editor, or `supabase db execute`.
-- Safe & idempotent: only alters grants/definer flags, no data touched.

-- 1. LIVE PII LEAK FIX -------------------------------------------------------
--    active_trials / expired_trials / active_subscribers are SECURITY DEFINER
--    views over `profiles`. `anon` had SELECT, so anyone holding the public
--    anon key could read every user's email + stripe_subscription_id via
--    /rest/v1/active_subscribers. Make them respect the caller's RLS...
alter view public.active_trials      set (security_invoker = true);
alter view public.expired_trials     set (security_invoker = true);
alter view public.active_subscribers set (security_invoker = true);

--    ...and revoke client access outright (these are ops/admin views).
revoke all on public.active_trials      from anon, authenticated;
revoke all on public.expired_trials     from anon, authenticated;
revoke all on public.active_subscribers from anon, authenticated;

-- 2. SECURITY DEFINER FUNCTIONS ---------------------------------------------
--    handle_new_user() and rls_auto_enable() were callable by anon/authenticated
--    over the public RPC endpoint. They're internal helpers — revoke EXECUTE.
revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.rls_auto_enable() from anon, authenticated, public;

-- 3. MUTABLE search_path ----------------------------------------------------
--    Pin search_path so a hijacked path can't redirect the functions' calls.
alter function public.set_updated_at()  set search_path = '';
alter function public.handle_new_user() set search_path = '';
alter function public.rls_auto_enable() set search_path = '';

-- 4. Manual dashboard toggles (cannot be set via SQL):
--    • Auth → Providers → Email: enable "Leaked password protection"
--      (checks new passwords against HaveIBeenPwned).

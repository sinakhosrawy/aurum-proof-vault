<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Public gold lookup goes through the security-definer RPC `lookup_gold`; gold_items has no anon access. Why: customers can only fetch one code at a time, not list all.
- Admin role lives in `user_roles`; the first signed-up account becomes admin via trigger. Why: no hardcoded credentials.
- Site settings (name, phones, address, socials jsonb) are a single row id=1 in `site_settings`, publicly readable. Why: admin edits everything from the panel.

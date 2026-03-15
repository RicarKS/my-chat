# My Chat - Project Instructions

## Git Workflow

### When to Commit & Push

**Commit timing — only when a logical unit of work is complete and verified:**
- A feature fully implemented and tested (e.g., "model provider system")
- A bug fix confirmed working (e.g., via Playwright screenshot or curl test)
- A batch of related changes completed (e.g., "all UI text translated to Chinese")

**Do NOT commit during:**
- Iterative debugging (try fix → test → try again)
- Partial implementations that break existing functionality
- Exploratory changes that may be reverted

**Push timing — same as commit.** This project uses a simple workflow; every commit to main should be pushable. Don't accumulate local-only commits.

### Branch Strategy

**Work directly on `main` for:**
- Bug fixes
- Small features (< ~5 files changed)
- Config/style tweaks
- Documentation updates

**Create a feature branch for:**
- Large features that span multiple sessions or touch 10+ files
- Risky refactors that might break existing functionality (e.g., database schema changes)
- Experimental changes you're unsure about keeping

**Branch naming:** `feat/<short-description>` or `fix/<short-description>`
Examples: `feat/voice-input`, `fix/mobile-layout`, `feat/rag-search`

**Branch lifecycle:**
1. Create branch from main: `git checkout -b feat/xxx`
2. Work and commit on the branch
3. When complete and verified, merge to main: `git checkout main && git merge feat/xxx`
4. Push main and delete branch: `git push origin main && git branch -d feat/xxx`
5. Do NOT push feature branches to remote unless collaboration is needed

### Commit Messages

Format — imperative mood, structured as:
```
<type>: <concise summary in Chinese or English>

<optional body: bullet points explaining what changed and why>

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
```

**Types:**
- `feat` — new feature
- `fix` — bug fix
- `refactor` — code restructuring without behavior change
- `style` — CSS/UI changes only
- `chore` — config, deps, build, docs

**Examples:**
```
feat: add model provider management with auto-discovery

- New model_providers table, migration 003
- Provider CRUD API endpoints
- Fetch available models from upstream /v1/models
- Two-tier settings UI: provider → models
```

```
fix: layout, mobile, and SSR hydration issues

- Auth/guest middleware skip server-side to prevent SSR redirect
- Sidebar uses normal flex instead of position:fixed
- Pages use position:absolute to bypass Nuxt wrappers
```

### Push Authentication

Remote URL uses gh auth token. If push fails with auth error:
```bash
git remote set-url origin https://RicarKS:$(gh auth token)@github.com/RicarKS/my-chat.git
```

## Tech Notes

- **Nuxt 4 component auto-import:** `pathPrefix: false` is set in nuxt.config.ts — components register by filename only (e.g., `LoginForm`, not `AuthLoginForm`)
- **Middleware:** auth.ts and guest.ts skip SSR (`if (import.meta.server) return`) to avoid hydration mismatch
- **Layout:** Single default layout; sidebar visibility controlled by route + auth state via `v-show`, no layout switching
- **Page sizing:** Pages use `position: absolute; inset: 0` to fill `.app-main`, bypassing Nuxt internal wrapper divs
- **Database migrations:** Embedded in `server/database/migrator.ts` as inline SQL strings (not file-based) for Nitro bundle compatibility
- **Debugging layout:** Use Playwright script at `/tmp/debug-page.mjs` to capture screenshots and DOM tree with computed styles

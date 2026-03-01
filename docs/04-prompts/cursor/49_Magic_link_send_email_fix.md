Goal: I need a dev-only way to retrieve the magic link token for testing, because request-access logs no longer print the token URL and the endpoint response is only {ok:true}. Implement a safe dev-only output without changing production behavior or security.

Requirements:

In app/api/resources/request-access/route.ts after successfully creating the token and before returning, build magicLinkUrl exactly as used for emails: ${APP_BASE_URL}/resources/download?token=${token}.

If process.env.NODE_ENV === "development", log a single line:

[IVT][RESOURCES] magic-link url=<magicLinkUrl> exp=<ISO expiresAt> email=<email> resourceKey=<resourceKey> projectSlug=<projectSlug>
Do NOT log the token hash.

Do NOT include the token or magicLinkUrl in the JSON response in production. Optionally (preferred): include { devMagicLinkUrl: magicLinkUrl } only when NODE_ENV === "development"; otherwise keep response {ok:true}.

Apply the same behavior to app/api/resources/resend-access/route.ts (log the new magic link URL in dev after creating the new token).

Ensure the email sending behavior stays identical (still uses Resend utility). No changes to gating logic, token generation, rate limiting, or DB schema.

Update docs/03-cms-directus/04-gated-resources-testing.md to mention that in development the server logs the magic link URL for curl testing.

Acceptance checks:

curl -X POST /api/resources/request-access ... still returns {ok:true} in production mode, and returns {ok:true, devMagicLinkUrl:"..."} only in development.

The terminal shows the new [IVT][RESOURCES] magic-link url=... line so I can copy the token and continue with validate/download tests.

No token leakage in production logs or responses.
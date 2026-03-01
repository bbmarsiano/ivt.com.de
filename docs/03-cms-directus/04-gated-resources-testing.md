# Gated Resources Testing Guide

## Overview

This document provides testing steps for the gated resources feature, including:
- Public resources (always downloadable)
- Gated resources (require access request)
- Magic link download landing page
- Resend access token functionality

## Prerequisites

1. Directus running locally (`docker-compose -f docker/docker-compose.directus.yml up`)
2. `.env.local` configured with:
   - `USE_DIRECTUS=1`
   - `DIRECTUS_URL=http://localhost:8055`
   - `DIRECTUS_TOKEN=<your-token>`
3. Next.js dev server running (`npm run dev`)

## Resend Setup

Before testing email functionality, configure Resend in `.env.local`:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=IVT <noreply@yourdomain.com>
APP_BASE_URL=http://localhost:3000
```

**Getting a Resend API Key**:
1. Sign up at https://resend.com
2. Create an API key in the dashboard
3. Add your sending domain (or use Resend's test domain for development)
4. Copy the API key to `RESEND_API_KEY` in `.env.local`

**Note**: If `RESEND_API_KEY` is not configured:
- In **development**: The system will log email URLs to the console instead of sending emails
- In **production**: The system will return an error (email sending is required)

## Development Mode Features

When running in development mode (`NODE_ENV=development`), the following dev-only features are available to simplify testing:

### 1. Terminal Logging

Both `/api/resources/request-access` and `/api/resources/resend-access` endpoints log magic link URLs to the terminal console:

```
[IVT][RESOURCES] magic-link url=http://localhost:3000/resources/download?token=... exp=2026-01-24T12:00:00.000Z email=test@example.com resourceKey=test-resource projectSlug=digital-health
```

**How to use**:
1. Make a request to `request-access` or `resend-access` endpoint
2. Check your terminal output for the `[IVT][RESOURCES] magic-link` log line
3. Copy the URL from the log and use it for testing (no email needed)

### 2. JSON Response with Magic Link

In development mode, API responses include the magic link URL directly in the JSON response:

**Request access**:
```bash
curl -X POST http://localhost:3000/api/resources/request-access \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","company":"Test Co","resourceKey":"test-resource","projectSlug":"digital-health"}'
```

**Development response**:
```json
{
  "ok": true,
  "devMagicLinkUrl": "http://localhost:3000/resources/download?token=..."
}
```

**Production response** (for comparison):
```json
{
  "ok": true
}
```

**Resend access**:
```bash
curl -X POST http://localhost:3000/api/resources/resend-access \
  -H "Content-Type: application/json" \
  -d '{"token":"<expired-token>"}'
```

**Development response**:
```json
{
  "ok": true,
  "devMagicLinkUrl": "http://localhost:3000/resources/download?token=..."
}
```

**Production response**:
```json
{
  "ok": true
}
```

### 3. Testing Workflow

**Recommended testing workflow in development**:

1. **Option A: Use terminal logs**
   - Make API request via curl or browser
   - Check terminal for `[IVT][RESOURCES] magic-link` log
   - Copy URL from log and test in browser

2. **Option B: Use JSON response**
   - Make API request via curl
   - Extract `devMagicLinkUrl` from JSON response
   - Use URL for testing

3. **Option C: Use email (if Resend configured)**
   - Make API request
   - Check email inbox for magic link
   - Use link from email

**Note**: In production, `devMagicLinkUrl` is never included in responses, and terminal logging is disabled. Always use email links in production.

## Test Scenarios

### 1. Public Resources (Always Downloadable)

**Goal**: Verify public resources show direct download button, ignoring `gated` flag.

**Steps**:
1. In Directus, create/edit a resource:
   - Add category "public"
   - Set `gated=true` (should be ignored)
   - Set `file_id` or `external_url`
2. Visit a project page with this resource: `http://localhost:3000/projects/<slug>`
3. Verify:
   - Resource shows "Public" badge
   - Resource shows "Download" button (not "Request access")
   - Clicking download works immediately

**Curl verification**:
```bash
# Check debug endpoint
curl -s http://localhost:3000/api/debug/cms | jq '.directusProjectResourcesSample[] | select(.isPublic == true) | {key, title_en, isPublic, shouldShowRequestAccess, downloadUrlVisible}'
```

Expected: `isPublic: true`, `shouldShowRequestAccess: false`, `downloadUrlVisible: true`

**Note**: In development mode, the server logs the magic link URL after creating a token. Check terminal output for `[IVT][RESOURCES] magic-link url=...` to copy the token for testing.

### 2. Gated Non-Public Resources

**Goal**: Verify gated resources require access request and never expose file URLs.

**Steps**:
1. In Directus, create/edit a resource:
   - Remove "public" category (or ensure it's not in categories)
   - Set `gated=true`
   - Set `file_id` (UUID)
2. Visit project page: `http://localhost:3000/projects/<slug>`
3. Verify:
   - Resource shows "Locked" badge (not "Gated")
   - Resource shows "Request access" button
   - No `/api/media/<file_id>` URL visible in HTML source or network tab
4. Click "Request access":
   - Modal opens with email + company fields
   - Submit form
   - Success message: "Check your email — link valid for 24 hours and can be used multiple times"
5. Check terminal logs (development mode):
   - Should see: `[IVT][RESOURCES] magic-link url=http://localhost:3000/resources/download?token=... exp=... email=... resourceKey=... projectSlug=...`
   - Or check response JSON: `{"ok": true, "devMagicLinkUrl": "http://localhost:3000/resources/download?token=..."}`

**Curl verification**:
```bash
# Check debug endpoint
curl -s http://localhost:3000/api/debug/cms | jq '.directusProjectResourcesSample[] | select(.gated == true and .isPublic == false) | {key, title_en, gated, isPublic, shouldShowRequestAccess, downloadUrlVisible}'
```

Expected: `isPublic: false`, `shouldShowRequestAccess: true`, `downloadUrlVisible: false`

### 3. Token Validation Endpoint

**Goal**: Verify the lightweight validation endpoint works correctly.

**Curl verification**:
```bash
# Validate a valid token
TOKEN="<token-from-request-access>"
curl -s "http://localhost:3000/api/resources/validate?token=$TOKEN" | jq
```

Expected response for valid token:
```json
{
  "ok": true,
  "status": "valid",
  "resourceKey": "test-resource",
  "expiresAt": "2026-01-24T12:00:00.000Z",
  "filename": "document.pdf"
}
```

Expected response for expired token:
```json
{
  "ok": false,
  "status": "expired"
}
```

### 4. Magic Link Download Landing Page

**Goal**: Verify `/resources/download?token=...` validates token first, then triggers download without infinite spinner.

**Steps**:
1. Request access to a gated resource (see scenario 2)
   - Check email inbox (or terminal logs if RESEND_API_KEY not configured) for download link
2. Open the link in browser: `http://localhost:3000/resources/download?token=<hex>`
3. Verify:
   - Page shows "Validating..." briefly
   - Then shows "Your download is starting…" with a download button
   - Download starts automatically (browser handles it)
   - **NO infinite spinner** - page transitions to stable "started" state
   - Shows note: "This link works multiple times until it expires"

**Curl verification (valid token)**:
```bash
# Validate token first
TOKEN="<token-from-email>"
curl -s "http://localhost:3000/api/resources/validate?token=$TOKEN" | jq '.status'
# Should return "valid"

# Then test landing page (in browser, not curl)
# Open: http://localhost:3000/resources/download?token=$TOKEN
```

**Curl verification (expired token)**:
```bash
# Use an old/expired token
TOKEN="<expired-token>"
curl -s "http://localhost:3000/resources/download?token=$TOKEN" | grep -i "expired\|abgelaufen"
```

Expected: Page shows "Link Expired" message with "Resend link" button

### 5. Resend Access Token

**Goal**: Verify expired tokens can request a new link.

**Steps**:
1. Use an expired token URL: `http://localhost:3000/resources/download?token=<expired>`
2. Page should show "Link Expired" with "Send a new link" button
3. Click "Send a new link"
4. Verify:
   - Button shows "Sending..." then "Email sent! Please check your inbox"
   - In development mode, terminal logs show: `[IVT][RESOURCES] magic-link url=... exp=... email=... resourceKey=... projectSlug=...`
   - In development mode, response includes: `{"ok": true, "devMagicLinkUrl": "..."}`
   - New token URL is different from old one

**Curl verification**:
```bash
# Resend access
TOKEN="<expired-token>"
curl -X POST http://localhost:3000/api/resources/resend-access \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$TOKEN\"}"
```

Expected:
- In development: `{"ok": true, "devMagicLinkUrl": "http://localhost:3000/resources/download?token=..."}` and terminal log with new token URL
- In production: `{"ok": true}` and new token sent via email (or logged if RESEND_API_KEY not configured)

**Rate limit test**:
```bash
# Try resending 4 times quickly (limit is 3/hour per request_id)
for i in {1..4}; do
  curl -X POST http://localhost:3000/api/resources/resend-access \
    -H "Content-Type: application/json" \
    -d "{\"token\": \"$TOKEN\"}"
  echo ""
done
```

Expected: First 3 return `{"ok": true}`, 4th returns `{"error": "Rate limit exceeded..."}` with 429 status

### 6. Non-Gated Non-Public Resources

**Goal**: Verify non-gated resources show normal download (not request access).

**Steps**:
1. In Directus, create/edit a resource:
   - Remove "public" category
   - Set `gated=false`
   - Set `file_id` or `external_url`
2. Visit project page
3. Verify:
   - No "Locked" badge
   - Shows "Download" button (not "Request access")
   - Download works immediately

### 7. External Link Resources

**Goal**: Verify LINK type resources open in new tab with external icon.

**Steps**:
1. In Directus, create/edit a resource:
   - Set `type=LINK`
   - Set `external_url=https://example.com`
2. Visit project page
3. Verify:
   - Resource shows "External" badge
   - Button shows "Open" (not "Download")
   - Clicking opens in new tab (`target="_blank"`)

### 8. Email Sending

**Goal**: Verify emails are sent (or logged) when requesting access and resending.

**Steps**:
1. Request access to a gated resource
2. Check:
   - If `RESEND_API_KEY` configured: Check email inbox for magic link
   - If `RESEND_API_KEY` not configured: Check terminal logs for `[IVT][EMAIL]` messages
3. Verify email contains:
   - Download link: `http://localhost:3000/resources/download?token=...`
   - Expiry date
   - Company and resource information
   - Multi-use until expiry note
4. Test resend:
   - Use expired token link
   - Click "Resend link"
   - Verify new email is sent (or logged) with NEW token URL (different from old one)

**Curl verification**:
```bash
# Request access (should trigger email or log)
curl -X POST http://localhost:3000/api/resources/request-access \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","company":"Test Co","resourceKey":"test-resource","projectSlug":"digital-health"}'

# In development mode:
# - Response includes: {"ok": true, "devMagicLinkUrl": "http://localhost:3000/resources/download?token=..."}
# - Terminal logs: [IVT][RESOURCES] magic-link url=... exp=... email=... resourceKey=... projectSlug=...
# - Copy the URL from response or terminal log for testing

# In production mode:
# - Response: {"ok": true} (no devMagicLinkUrl)
# - Check email inbox (if RESEND_API_KEY configured) or check terminal for email log (if not configured)
```

### 9. Security Checks

**Goal**: Verify gated resources never expose file URLs.

**Steps**:
1. Request access to a gated resource
2. Open browser DevTools → Network tab
3. Filter by "resources" or "media"
4. Verify:
   - No `/api/media/<file_id>` requests before access granted
   - No file URLs in HTML source for gated resources
   - Only `/api/resources/request-access` and `/api/resources/download?token=...` calls

**Curl verification**:
```bash
# Check that gated resources have null downloadUrl in API response
curl -s http://localhost:3000/api/debug/cms | jq '.directusProjectResourcesSample[] | select(.gated == true and .isPublic == false) | {key, downloadUrl}'
```

Expected: `downloadUrl: null` for gated non-public resources

## Debug Endpoint

The `/api/debug/cms` endpoint now includes resource visibility flags:

```bash
curl -s http://localhost:3000/api/debug/cms | jq '.directusProjectResourcesSample[] | {key, title_en, isPublic, shouldShowRequestAccess, downloadUrlVisible}'
```

Fields:
- `isPublic`: true if resource has "public" category
- `shouldShowRequestAccess`: true if resource should show "Request access" button
- `downloadUrlVisible`: true if `downloadUrl` can be safely exposed in HTML/JSON

## Common Issues

### Issue: Download page shows "Invalid token" immediately

**Cause**: Token not found in database or token hash mismatch.

**Fix**: Check terminal logs for `[IVT][RESOURCES] request-access` to see if token was created. Verify token hash matches.

### Issue: Resend returns 404

**Cause**: Token not found (may have been deleted or never created).

**Fix**: Request new access and use the token from logs.

### Issue: Rate limit hit too quickly

**Cause**: In-memory rate limiting resets on server restart.

**Fix**: Restart dev server to clear rate limit map, or wait for the time window to expire.

### Issue: Gated resource shows download button

**Cause**: Resource has "public" category (public resources ignore gated flag).

**Fix**: Remove "public" category from resource in Directus.

## Manual Browser Testing Checklist

- [ ] Public resource shows "Download" button
- [ ] Gated resource shows "Request access" button and "Locked" badge
- [ ] Request access modal submits successfully
- [ ] Success message mentions "24 hours and can be used multiple times"
- [ ] Email is sent (or logged) with download link
- [ ] Magic link URL from email opens download page
- [ ] Landing page shows "Validating..." then "Your download is starting…"
- [ ] Download starts automatically (browser handles it)
- [ ] **NO infinite spinner** - page shows stable "started" state with download button
- [ ] Manual download button works if auto-download fails
- [ ] Expired token shows "Link Expired" with resend button
- [ ] Resend creates new token and sends email (or logs)
- [ ] Resend success shows "A new link has been sent to your email"
- [ ] Invalid token shows "Invalid Link" with contact link
- [ ] Revoked token shows "Link Revoked" with resend option
- [ ] Rate limit shows "Too Many Requests" message
- [ ] No `/api/media/<file_id>` URLs visible in HTML for gated resources
- [ ] External LINK resources open in new tab
- [ ] Debug endpoint shows correct `isPublic`, `shouldShowRequestAccess`, `downloadUrlVisible` flags
- [ ] Validation endpoint returns correct status for valid/expired/invalid tokens
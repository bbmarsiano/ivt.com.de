# Security Notes

This document tracks security vulnerabilities that remain after applying safe fixes.

## Last Updated
Date: 2026-01-20
Status: After running `npm audit fix` (safe mode, without --force)

## Remaining Vulnerabilities

### 1. Next.js (Critical)
- **Package**: `next@13.5.1`
- **Severity**: Critical
- **Vulnerabilities**: Multiple security issues including:
  - Server-Side Request Forgery in Server Actions
  - Cache Poisoning
  - Denial of Service conditions
  - Authorization bypass vulnerabilities
  - Content Injection vulnerabilities
  - And others (see full list in `npm audit` output)
- **Suggested Fix**: Upgrade to `next@13.5.11` (patch version within same major.minor)
- **Why Not Fixed Yet**: 
  - Requires `npm audit fix --force` which may introduce breaking changes
  - Next.js 13.5.11 is a patch version upgrade, but the audit system flags it as "outside the stated dependency range"
  - Recommendation: Manually test upgrade to `next@13.5.11` in a separate branch before applying

### 2. PostCSS (Moderate)
- **Package**: `postcss@8.4.30` (via Next.js dependency)
- **Severity**: Moderate
- **Vulnerability**: PostCSS line return parsing error (GHSA-7fh5-64p2-3v2j)
- **Suggested Fix**: Upgrade to `postcss@8.4.31` or later
- **Why Not Fixed Yet**: 
  - This is a transitive dependency of Next.js
  - Will be resolved when Next.js is upgraded to 13.5.11

### 3. Zod (Moderate)
- **Package**: `zod@3.23.8` (via Next.js dependency)
- **Severity**: Moderate
- **Vulnerability**: Zod denial of service vulnerability (GHSA-m95q-7qp3-xv42)
- **Suggested Fix**: Upgrade to `zod@3.22.3` or later (note: current version 3.23.8 should be safe, but Next.js may be bundling an older version)
- **Why Not Fixed Yet**: 
  - This is a transitive dependency of Next.js
  - Will be resolved when Next.js is upgraded to 13.5.11

## Fixed Vulnerabilities

The following vulnerabilities were automatically fixed by `npm audit fix`:
- @babel/runtime (moderate)
- brace-expansion (ReDoS)
- cross-spawn (high - ReDoS)
- glob (high - command injection)
- js-yaml (moderate - prototype pollution)
- nanoid (moderate - predictable results)

## Recommendations

1. **Immediate Action**: Consider manually upgrading Next.js to `13.5.11`:
   ```bash
   npm install next@13.5.11
   ```
   Then run `npm install` to update lockfile and test thoroughly.

2. **Testing**: After upgrading Next.js, verify:
   - `npm run dev` works correctly
   - `npm run build` completes successfully
   - All pages render correctly
   - No runtime errors in console

3. **Future**: Monitor for Next.js 14.x upgrade path when ready for major version upgrade.

## Audit Command

To check current status:
```bash
npm audit
```

To apply safe fixes only:
```bash
npm audit fix
```

**DO NOT** run `npm audit fix --force` without thorough testing, as it may introduce breaking changes.

## Environment Variables

The application now uses `NEXT_PUBLIC_SITE_URL` for metadata base URL. Create a `.env.local` file (or set in your deployment environment) with:

```
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

For local development, it defaults to `http://localhost:3000` if not set.

You are performing a full technical state extraction of this Next.js project.

Your goal is to generate a COMPLETE technical snapshot of the current system implementation.

This is NOT a summary.
This is a full engineering audit of the codebase as it currently exists.

========================
SCOPE
========================

Scan the entire project and extract:

1. Architecture overview
2. All API routes and their logic
3. Database models (Prisma schema)
4. Security mechanisms
5. Token logic (generation, validation, hashing, expiry)
6. Email sending logic (Resend integration)
7. Directus integration layer
8. Rate limiting implementation
9. Environment variables used
10. Dev-only logic or fallbacks
11. Error handling patterns
12. Logging patterns
13. Edge cases handled
14. TODO / FIXME / console logs
15. Unused code or dead branches
16. Multi-use token behaviour
17. Resource download protection logic
18. Resend-access logic flow
19. Any missing production safeguards

========================
OUTPUT FORMAT
========================

Return structured output in this exact structure:

# 1. SYSTEM ARCHITECTURE

- Framework
- Runtime
- Folder structure explanation
- Separation of concerns
- API routing structure
- CMS abstraction layer
- Database layer separation

# 2. DATABASE STRUCTURE (Prisma)

- Full model definitions
- Relations
- Indexes
- Constraints
- Missing FK risks
- Security considerations

# 3. API ROUTES

For EACH route:
- Path
- Method
- Input
- Validation
- Core logic
- Security checks
- Error handling
- Side effects
- Weaknesses

# 4. TOKEN SYSTEM

Explain in detail:
- How token is generated
- Hashing method
- Where stored
- How validated
- Expiry logic
- Revocation logic
- Multi-use behaviour
- Replay attack risk
- Production safety level

# 5. RATE LIMITING

- Implementation method
- Storage (memory / db)
- Reset logic
- Production safety analysis

# 6. DIRECTUS INTEGRATION

- Collections used
- M2M logic
- File resolution logic
- Validation rules
- Fallback behaviour

# 7. EMAIL DELIVERY (RESEND)

- Where email is triggered
- Template source
- Token embedding logic
- Dev fallback
- Production readiness

# 8. SECURITY ANALYSIS

List:
- What is secure
- What is partially secure
- What is risky
- What must be fixed before production

# 9. DEV-ONLY CODE

List:
- devMagicLinkUrl
- console logs
- debug flags
- unsafe fallbacks

# 10. PRODUCTION READINESS GAPS

Explicit checklist of what must be implemented before production.

# 11. DEAD CODE / CLEANUP

List anything that:
- is unused
- is redundant
- is duplicated
- can cause confusion

========================
IMPORTANT
========================

Do NOT summarize.
Do NOT generalize.
Extract only what is ACTUALLY implemented in the codebase.

If something is assumed but not implemented, clearly mark:
"NOT IMPLEMENTED – only conceptually discussed"

Be brutally technical.
Be precise.
Be complete.

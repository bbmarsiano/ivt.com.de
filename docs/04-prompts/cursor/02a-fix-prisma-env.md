Fix Prisma P1012: Environment variable not found: DATABASE_URL.

Context:
- Next.js uses .env.local, but Prisma CLI loads .env by default.
- We currently have DATABASE_URL in .env.local only.

Tasks:
1) Create a root .env file (if missing) and add:
   DATABASE_URL="postgresql://dimitarmitrev@localhost:5432/ivt_dev"
   (Optionally also add RESEND_API_KEY, FROM_EMAIL, NEXT_PUBLIC_SITE_URL for consistency.)

2) Ensure .env is included in .gitignore (do not commit secrets).
3) Update docs:
   - APPLY_FLOW.md: clarify that Prisma CLI uses .env, Next uses .env.local.
   - PROJECT_READY_FOR_CURSOR.md: add troubleshooting note for P1012.

4) Verify commands:
   - npx prisma generate
   - npx prisma migrate dev
   should work.

Deliverable:
- Prisma commands run successfully.
- Documentation updated.

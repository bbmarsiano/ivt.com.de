Fix GET /api/resources/download token validation query: Postgres error "operator does not exist: uuid = text" (42883).

Context:
Calling:
  curl -i "http://localhost:3000/api/resources/download?token=...."
returns 500 with:
  ERROR: operator does not exist: uuid = text

Goal:
Ensure every UUID comparison in raw SQL casts params correctly, especially in the download handler where we lookup token row and increment use_count.

Instructions:
1) Find the route handler for GET /api/resources/download (likely app/api/resources/download/route.ts).
2) Identify any prisma.$queryRaw or prisma.$executeRaw statements that compare UUID columns (id, request_id, project_id) to interpolated params or JS strings.
3) Add explicit Postgres casts:
   - For UUID columns, use `${value}::uuid`
   - For example:
       WHERE t.id = ${tokenRow.id}::uuid
       WHERE t.request_id = ${requestId}::uuid
4) Specifically check the UPDATE that increments use_count, and ensure the WHERE clause casts the id to uuid.
5) Keep multi-use until expiry logic unchanged.
6) Add a small dev log when a token is found (token_id, request_id) to confirm path.
7) After change, `curl -i /api/resources/download?token=...` should return 200 and the DB use_count should increment.

Do not change DB schema. Do not change token hashing logic.

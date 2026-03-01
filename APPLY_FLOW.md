# Project Application Flow Documentation

This document describes the double opt-in application flow for project applications.

## Overview

The application flow consists of:
1. User submits application form
2. Application is saved to database with `pending_confirmation` status
3. Confirmation email is sent to applicant
4. Applicant clicks confirmation link
5. Application status changes to `confirmed`
6. Coordinator receives notification email
7. Application status changes to `forwarded`

## Database Schema

### ProjectApplication Model

```prisma
enum ApplicationStatus {
  pending_confirmation
  confirmed
  forwarded
}

model ProjectApplication {
  id                     String             @id @default(uuid())
  projectSlug            String
  status                 ApplicationStatus @default(pending_confirmation)
  companyName            String
  companyEmail           String
  companyWebsite         String
  contactPerson           String
  contactDetails          String
  message                String
  confirmationToken      String            @unique
  confirmationExpiresAt  DateTime
  confirmedAt            DateTime?
  forwardedAt            DateTime?
  coordinatorEmail       String
  createdAt              DateTime          @default(now())
  updatedAt              DateTime          @updatedAt

  @@index([confirmationToken])
  @@index([projectSlug])
  @@index([status])
}
```

## API Endpoints

### POST /api/applications

Submit a new project application.

**Request Body:**
```json
{
  "projectSlug": "ai-research-hub",
  "companyName": "Example Corp",
  "companyEmail": "contact@example.com",
  "companyWebsite": "https://example.com",
  "contactPerson": "John Doe",
  "contactDetails": "Phone: +49 123 456789",
  "message": "We are interested in this project..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Application submitted successfully"
}
```

**Response (Error):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "companyEmail",
      "message": "Invalid email address"
    }
  ]
}
```

**Features:**
- Zod validation
- Honeypot field (`website2`) - silently rejects if filled
- Rate limiting (5 requests per 15 minutes per IP)
- Coordinator email resolution from project data
- Confirmation email sent automatically

### POST /api/applications/confirm

Confirm an application using a confirmation token.

**Request Body:**
```json
{
  "token": "uuid-token-from-email"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Application confirmed successfully"
}
```

**Response (Error):**
```json
{
  "error": "Invalid or expired confirmation token"
}
```

**Features:**
- Token validation
- Expiry check (48 hours)
- Status update to `confirmed`
- Coordinator email sent
- Status update to `forwarded` after email success

## Environment Variables

**Important**: Prisma CLI and Next.js use different environment files:
- **Prisma CLI** (migrations, generate) reads from `.env` by default
- **Next.js** (runtime) reads from `.env.local` by default (and falls back to `.env`)

For consistency, you can use either:
- **Option 1**: Use `.env` for both (recommended for simplicity)
- **Option 2**: Use `.env` for Prisma CLI and `.env.local` for Next.js (keep secrets separate)

### Required

- `DATABASE_URL` - PostgreSQL connection string
  - Example: `postgresql://user:password@localhost:5432/ivt_db`
  - **Must be in `.env`** for Prisma CLI to work

- `RESEND_API_KEY` - Resend API key for sending emails
  - Get from: https://resend.com/api-keys
  - Can be in `.env` or `.env.local`

- `FROM_EMAIL` - Email address to send from
  - **Development**: `onboarding@resend.dev` (pre-configured, works without domain verification)
  - **Production**: Use your verified domain email (e.g., `noreply@yourdomain.com`)
  - Can be in `.env` or `.env.local`

### Optional

- `COORDINATOR_FALLBACK_EMAIL` - Fallback email if project coordinator email is missing
  - Useful for development/testing
  - Example: `dev@example.com`
  - Can be in `.env` or `.env.local`

- `NEXT_PUBLIC_SITE_URL` - Public site URL for confirmation links
  - Default: `http://localhost:3000`
  - Production: `https://yourdomain.com`
  - Can be in `.env` or `.env.local`

- `RESEND_TEST_TO_EMAIL` - Test email override (optional, for development)
  - When set, all emails are sent to this address instead of the intended recipient
  - Original recipient is shown in email body for debugging
  - Useful when Resend restricts testing emails to your own address
  - Example: `RESEND_TEST_TO_EMAIL=your-email@example.com`
  - **Remove this in production** once domain is verified

- `ADMIN_KEY` - Admin access key for admin pages (optional, for development)
  - Used to access `/admin/applications` page
  - Set a secure random string
  - Example: `ADMIN_KEY=your-secret-admin-key-here`
  - **Keep this secret** and do not commit to version control

## Development Setup

### 1. Database Setup

```bash
# Create database (PostgreSQL)
createdb ivt_db

# Run Prisma migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### 2. Environment Configuration

**Create `.env` file** (required for Prisma CLI):

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ivt_db
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=onboarding@resend.dev
NEXT_PUBLIC_SITE_URL=http://localhost:3000
COORDINATOR_FALLBACK_EMAIL=dev@example.com
# Optional: For Resend testing mode (see below)
RESEND_TEST_TO_EMAIL=your-email@example.com
```

**Note**: 
- Prisma CLI (`npx prisma migrate`, `npx prisma generate`) reads from `.env`
- Next.js runtime reads from `.env.local` first, then falls back to `.env`
- For simplicity, you can use `.env` for both
- Both `.env` and `.env.local` are gitignored (do not commit secrets)

### 2.5. Resend Testing Mode

When using Resend without a verified domain, you may encounter this error:
> "You can only send testing emails to your own email address..."

**Solution**: Set `RESEND_TEST_TO_EMAIL` in your `.env` file:

```env
RESEND_TEST_TO_EMAIL=your-email@example.com
```

**How it works**:
- All outgoing emails are automatically sent to `RESEND_TEST_TO_EMAIL` instead of the intended recipient
- The original intended recipient is shown in the email body (e.g., "🧪 Testing Mode: Intended recipient: ...")
- This allows you to test the full email flow end-to-end
- The system also automatically retries with the test email if Resend returns a testing restriction error

**Production**:
- Once your domain is verified in Resend, **remove** `RESEND_TEST_TO_EMAIL` from your `.env`
- Update `FROM_EMAIL` to use your verified domain (e.g., `noreply@yourdomain.com`)
- Emails will then be sent to the actual intended recipients

### 3. Testing the Flow

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Submit an application:**
   - Navigate to a project detail page
   - Click "Apply" button
   - Fill out the form
   - Submit

3. **Check database:**
   ```bash
   npx prisma studio
   ```
   - Verify application is created with `pending_confirmation` status

4. **Check email:**
   - Check the applicant's email inbox
   - Click the confirmation link

5. **Verify confirmation:**
   - Application status should be `forwarded`
   - Coordinator should receive email
   - Check database to confirm status updates

## Production Considerations

### Rate Limiting

The current implementation uses in-memory rate limiting, which:
- ✅ Works for single-instance deployments
- ❌ Does NOT work with multiple instances/load balancers

**For production**, implement one of:
- Redis-based rate limiting
- Cloudflare Rate Limiting
- AWS API Gateway throttling
- Other distributed rate limiting solution

### Email Domain Verification

1. **Add domain to Resend:**
   - Go to Resend dashboard
   - Add your domain
   - Verify DNS records

2. **Update FROM_EMAIL:**
   ```env
   FROM_EMAIL=noreply@yourdomain.com
   ```

3. **Remove testing override:**
   ```env
   # Remove or comment out RESEND_TEST_TO_EMAIL
   # RESEND_TEST_TO_EMAIL=your-email@example.com
   ```

4. **Test email delivery:**
   - Send test emails
   - Verify SPF/DKIM records

### Resend Testing Mode

When developing without a verified domain, Resend restricts testing emails to your own email address. To work around this:

**Setup**:
1. Set `RESEND_TEST_TO_EMAIL` in your `.env`:
   ```env
   RESEND_TEST_TO_EMAIL=your-email@example.com
   ```

2. All outgoing emails will be sent to this address instead of the intended recipient

3. The original intended recipient is shown in the email body:
   - HTML: Yellow notice box at the top: "🧪 Testing Mode: Intended recipient: ..."
   - Text: Prefix line: "🧪 Testing Mode: Intended recipient: ..."

**How it works**:
- If `RESEND_TEST_TO_EMAIL` is set, all emails automatically use it as the recipient
- If Resend returns a testing restriction error, the system automatically retries with the test email
- Console logs indicate when testing mode is active (no PII exposed)
- The confirmation link in emails still works correctly

**Production**:
- Once your domain is verified in Resend:
  1. Remove `RESEND_TEST_TO_EMAIL` from `.env`
  2. Update `FROM_EMAIL` to your verified domain email
  3. Emails will then be sent to actual recipients

### Database Indexes

The schema includes indexes on:
- `confirmationToken` (for fast lookups)
- `projectSlug` (for filtering)
- `status` (for queries)

Consider additional indexes based on query patterns.

### Error Handling

**Application Submission (`POST /api/applications`):**
- Database record is created FIRST
- Then confirmation email is attempted
- If email fails, DB record is saved but user receives error response
- User can request resend later (admin endpoint can be added)

**Application Confirmation (`POST /api/applications/confirm`):**
- Status updated to `confirmed` FIRST
- Then coordinator email is attempted
- If email fails, status remains `confirmed` (not `forwarded`)
- Application is confirmed but coordinator not notified yet
- Can be re-forwarded later (see below)

**Re-forwarding Failed Emails:**
Applications with status `confirmed` but not `forwarded` can be re-forwarded:
1. Query database for applications with `status = 'confirmed'` and `forwardedAt IS NULL`
2. Call `sendCoordinatorEmail()` with application data
3. Update status to `forwarded` and set `forwardedAt` on success
4. An admin endpoint can be added later: `POST /api/admin/applications/:id/forward`

**Monitoring:**
- Monitor application statuses for stuck `confirmed` (email failed)
- Consider implementing retry queues for failed emails
- Log email failures without exposing PII

### Security

- ✅ Honeypot field to deter bots
- ✅ Rate limiting to prevent abuse
- ✅ Server-side validation (Zod)
- ✅ Token-based confirmation (UUID)
- ✅ Token expiry (48 hours)
- ✅ Coordinator emails never exposed to client

## Troubleshooting

### Prisma P1012: Environment variable not found: DATABASE_URL

**Error**: `Error: P1012: Environment variable not found: DATABASE_URL`

**Cause**: Prisma CLI reads from `.env` by default, but you may have only created `.env.local` (which Next.js uses).

**Solution**:
1. Create a `.env` file in the project root (if it doesn't exist)
2. Add `DATABASE_URL` to `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/ivt_db"
   ```
3. Ensure `.env` is in `.gitignore` (it should be by default)
4. Run Prisma commands again:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

**Note**: 
- Prisma CLI uses `.env` (not `.env.local`)
- Next.js uses `.env.local` first, then falls back to `.env`
- For consistency, you can use `.env` for both, or keep them separate

### "RESEND_API_KEY is not set"

- Check `.env` file exists
- Verify `RESEND_API_KEY` is set
- Restart development server after adding env var

### "Cannot resolve coordinator email"

- Check project exists in mock data
- Set `COORDINATOR_FALLBACK_EMAIL` for development
- Verify project slug matches

### Confirmation link not working

- Check `NEXT_PUBLIC_SITE_URL` is correct
- Verify token hasn't expired (48 hours)
- Check database for application status

### Emails not sending

- Verify Resend API key is valid
- Check Resend dashboard for errors
- Verify `FROM_EMAIL` is valid (use `onboarding@resend.dev` for dev)
- Check spam folder
- If you see "You can only send testing emails to your own email address":
  - Set `RESEND_TEST_TO_EMAIL` in `.env` to your email address
  - All emails will be routed to that address automatically

### Build Error: Module not found: Can't resolve '@react-email/render'

**Error**: `Module not found: Can't resolve '@react-email/render'` during build

**Cause**: Resend SDK has optional dependencies for React email components, but we use plain HTML/text strings.

**Solution**: 
- The `next.config.js` is configured to ignore these optional dependencies
- We use plain HTML/text strings in `lib/emails/templates.ts` (no React components)
- If you see this error, ensure `next.config.js` has the webpack alias configuration

## Admin Page

A minimal admin interface is available to view and manage project applications.

### Access

**URL**: `/admin/applications?key=YOUR_ADMIN_KEY`

**Setup**:
1. Set `ADMIN_KEY` in your `.env` or `.env.local`:
   ```env
   ADMIN_KEY=your-secret-admin-key-here
   ```
2. Access the page with the key as a query parameter:
   ```
   http://localhost:3000/admin/applications?key=your-secret-admin-key-here
   ```

**Security**:
- Admin key is validated server-side (never exposed to client)
- If key is missing or incorrect, page shows 404 (does not reveal admin page exists)
- Keep `ADMIN_KEY` secret and do not commit it to version control

### Features

**View Applications**:
- Lists last 50 applications (most recent first)
- Shows: Created date, Project slug, Company name, Email, Status, Confirmed date, Forwarded date

**Filters**:
- **Status filter**: Filter by `pending_confirmation`, `confirmed`, or `forwarded`
- **Search**: Search by company email or project slug (case-insensitive)

**Actions**:
- **Resend Confirmation** (for `pending_confirmation` status):
  - Generates new confirmation token and expiry (48 hours)
  - Sends confirmation email again
  - Respects `RESEND_TEST_TO_EMAIL` if configured
- **Resend Forward** (for `confirmed` status without `forwardedAt`):
  - Sends coordinator email again
  - Updates status to `forwarded` and sets `forwardedAt`

### Usage Example

1. **View all applications**:
   ```
   /admin/applications?key=your-admin-key
   ```

2. **Filter by status**:
   ```
   /admin/applications?key=your-admin-key&status=confirmed
   ```

3. **Search for specific application**:
   ```
   /admin/applications?key=your-admin-key&search=example@company.com
   ```

4. **Combine filters**:
   ```
   /admin/applications?key=your-admin-key&status=pending_confirmation&search=ai-research
   ```

## File Structure

```
lib/
├── db/
│   └── prisma.ts              # Prisma client instance
├── emails/
│   ├── templates.ts            # Email templates
│   └── resend.ts               # Resend integration
├── env.server.ts               # Server-side env helpers
├── utils/
│   ├── coordinator.ts          # Coordinator email resolution
│   └── rateLimit.ts            # Rate limiting
└── validators/
    └── application.ts          # Zod validation schema

app/
├── api/
│   ├── applications/
│   │   ├── route.ts            # POST /api/applications
│   │   └── confirm/
│   │       └── route.ts       # POST /api/applications/confirm
│   └── admin/
│       └── applications/
│           └── [id]/
│               ├── resend-confirmation/
│               │   └── route.ts  # POST /api/admin/applications/[id]/resend-confirmation
│               └── resend-forward/
│                   └── route.ts  # POST /api/admin/applications/[id]/resend-forward
├── admin/
│   └── applications/
│       └── page.tsx            # Admin applications page
└── apply/
    └── confirm/
        └── page.tsx            # Confirmation page

components/
├── admin/
│   └── AdminApplicationsClient.tsx  # Admin table client component
└── projects/
    └── ApplyModal.tsx          # Application form modal

prisma/
└── schema.prisma               # Database schema
```

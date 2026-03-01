# Innovation Valley Thüringen - Cursor Ready

This project is export-ready and structured for seamless continuation in Cursor.

## What's Complete

### Core Application
- ✅ **Next.js 14 App Router** with TypeScript
- ✅ **Internationalization** (DE/EN) with lightweight context-based system
- ✅ **Responsive Design** with Tailwind CSS and shadcn/ui components
- ✅ **Premium UI/UX** with Framer Motion animations

### Pages & Routes
- ✅ Homepage with intro video overlay (localStorage persistence)
- ✅ Projects listing with filters (search, industry, status, sort)
- ✅ Project detail pages with gallery, apply modal, and comprehensive info
- ✅ About, Partners, News, Events, Resources, Contact
- ✅ Goals, Impact, Why Now, Why Thuringia
- ✅ Legal pages (Imprint, Privacy)

### Components Structure
```
components/
├── home/                  # Homepage-specific components
│   ├── FeaturedProjectsCarousel.tsx
│   ├── TestimonialsSlider.tsx
│   ├── NewsTeaser.tsx
│   └── EventsTeaser.tsx
├── projects/              # Project-related components
│   ├── ProjectCard.tsx
│   ├── ProjectFilters.tsx
│   ├── ApplyModal.tsx
│   └── GalleryLightbox.tsx
├── layout/                # Global layout components
│   ├── Header.tsx
│   └── Footer.tsx
└── ui/                    # shadcn/ui components
```

### Service Layer (CMS-Ready)
```
services/
└── contentService.ts      # Abstraction for all content fetching
    ├── getFeaturedProjects()
    ├── getProjects(filters)
    ├── getProjectBySlug(slug)
    ├── getFeaturedTestimonials()
    ├── getLatestNews(limit)
    ├── getUpcomingEvents(limit)
    └── More methods ready for expansion
```

**Important**: All UI components consume data through `contentService`. To switch from mock data to Directus, only update the service implementation—no UI changes needed.

### Validators
```
lib/validators/
├── index.ts               # Shared validation functions
│   ├── email validation
│   ├── url validation
│   ├── required field validation
│   └── Ready for expansion
└── application.ts        # Zod schema for application validation
```

### Mock Data (CMS-Schema Ready)
```
lib/mock/
├── projects.ts            # 6 comprehensive projects with bilingual content
├── testimonials.ts        # 4 partner testimonials
├── news.ts                # 5 news items
└── events.ts              # 5 events with locations and dates
```

All mock data structures are designed to match future Directus schema.

## What Remains (Next Steps in Cursor)

### Phase 1: Database & CMS Integration
- [ ] Set up Directus instance
- [ ] Create collections matching mock data structures
- [ ] Update `services/contentService.ts` to fetch from Directus API
- [ ] Add environment variables (see `.env.example`)
- [ ] Implement content caching strategy (React Query/SWR)

### Phase 2: Email Integration ✅ COMPLETE
- [x] Set up Resend email service
- [x] Create API route for project application submissions
- [x] Update `ApplyModal` to post to API endpoint
- [x] Add email templates (confirmation, coordinator notification)
- [x] Implement double opt-in flow with confirmation page
- [x] Database integration with Prisma
- [x] Rate limiting and honeypot protection
- [x] See `APPLY_FLOW.md` for detailed documentation

### Phase 3: Enhancement Features
- [ ] Admin authentication (if needed for protected routes)
- [ ] Content preview mode for draft CMS entries
- [ ] Analytics integration (Google Analytics / Plausible)
- [ ] SEO optimization (metadata, sitemaps, structured data)
- [ ] Performance optimization (image optimization, lazy loading)

### Phase 4: Deployment
- [ ] Configure production environment variables
- [ ] Set up CI/CD pipeline
- [ ] Deploy to Netlify/Vercel
- [ ] Connect production Directus instance
- [ ] Final testing and QA

## How to Run Locally

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Setup
```bash
# Install dependencies
npm install

# Copy environment variables (optional for now)
cp .env.example .env

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Development Server
The app runs at `http://localhost:3000` by default.

## Troubleshooting

### ChunkLoadError: Loading chunk failed

If you encounter `ChunkLoadError: Loading chunk app/page failed` or similar chunk loading errors:

1. **Clear the build cache:**
   ```bash
   rm -rf .next node_modules/.cache
   npm run build
   ```

2. **Restart the development server:**
   ```bash
   npm run dev
   ```

3. **Clear browser cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - Or clear site data in browser DevTools

**Common Causes:**
- Stale build artifacts in the `.next` directory
- Hot Module Replacement (HMR) issues requiring a fresh start
- Browser caching old JavaScript chunks
- Server/client boundary issues (now resolved with Providers wrapper)

**Error Handling:**
The app includes error boundaries:
- `app/error.tsx` - Catches runtime errors with recovery options
- `app/loading.tsx` - Shows loading state during navigation

### Prisma P1012: Environment variable not found: DATABASE_URL

If you encounter `Error: P1012: Environment variable not found: DATABASE_URL` when running Prisma commands:

**Cause**: Prisma CLI reads from `.env` by default, but Next.js uses `.env.local`. If you only created `.env.local`, Prisma won't find the variables.

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
- See `APPLY_FLOW.md` for more details on environment variable setup

## Project Structure

```
innovation-valley/
├── app/                   # Next.js 14 App Router pages
│   ├── layout.tsx        # Root layout (server component)
│   ├── error.tsx         # Error boundary
│   ├── loading.tsx       # Loading state
│   ├── page.tsx          # Homepage
│   ├── projects/         # Projects pages
│   ├── apply/            # Application confirmation page
│   ├── api/              # API routes
│   │   └── applications/ # Application submission and confirmation
│   └── [other-routes]/   # Additional pages
├── components/           # React components (organized by domain)
│   ├── Providers.tsx     # Client providers wrapper
├── lib/                  # Utilities and configuration
│   ├── i18n/            # Internationalization
│   ├── mock/            # Mock data (CMS-ready schema)
│   ├── validators/      # Shared validation functions
│   ├── db/              # Database (Prisma client)
│   ├── emails/          # Email templates and Resend integration
│   ├── utils/           # Utility functions (rate limiting, coordinator)
│   ├── env.server.ts    # Server-side environment helpers
│   └── utils.ts         # Helper functions
├── services/             # Business logic and data fetching
│   └── contentService.ts # Content abstraction layer
├── prisma/               # Prisma schema and migrations
│   └── schema.prisma    # Database schema
├── public/              # Static assets
├── .env.example         # Environment variables template
└── PROJECT_READY_FOR_CURSOR.md  # This file
```

## Key Technologies

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Radix UI primitives)
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Design Principles

- **Premium German Engineering Aesthetic**: Minimal, clean, high-quality
- **Mobile-First**: Fully responsive across all breakpoints
- **Accessibility**: ARIA labels, keyboard navigation, semantic HTML
- **Performance**: Optimized images, lazy loading, code splitting
- **Maintainability**: Clear structure, reusable components, typed interfaces

## Architecture

### Server/Client Boundaries
The app uses Next.js 14 App Router with proper server/client component separation:

- **Server Components (default)**: `app/layout.tsx`, most page components
- **Client Components**: Marked with `'use client'` directive
- **Providers Pattern**: All client-side context providers (Language, IntroOverlay) are wrapped in `components/Providers.tsx` to maintain clean boundaries and prevent chunk loading issues

### State Management
- **Language Context**: Global i18n state via React Context
- **Intro Overlay**: localStorage-based (accessed only in `useEffect` to avoid hydration issues)
- **Form State**: Local component state with shared validators

### Error Handling
- **Error Boundary**: `app/error.tsx` catches runtime errors with "Try Again" and "Go Home" options
- **Loading States**: `app/loading.tsx` provides consistent loading UI
- **Form Validation**: Centralized validators in `lib/validators`

## Notes for Cursor Development

1. **Service Layer First**: Always consume data through `contentService`, never import mock data directly in components.

2. **Validation**: Use shared validators from `lib/validators` for all form validations.

3. **Translations**: Add new translations to `lib/i18n/translations.ts` and use the `useLanguage` hook in components.

4. **Component Organization**: Follow the existing structure—group components by domain (home/, projects/, layout/, etc.).

5. **Type Safety**: Leverage TypeScript interfaces defined in mock data files and service layer.

6. **SSR Safe**: Use client components (`'use client'`) only when necessary (state, effects, browser APIs). All context providers are wrapped in `components/Providers.tsx` to maintain clean server/client boundaries.

7. **Error Recovery**: The app includes `error.tsx` and `loading.tsx` for graceful error handling and loading states.

## Contact & Documentation

- All UI/UX patterns are established and should be followed for consistency
- Mock data structures in `lib/mock/*` represent the intended CMS schema
- The intro video overlay uses localStorage key `ivt_intro_seen`
- Apply modal shows success message: "Email been send for application confirmation. Please confirm by click on the link in the email"
- **Application Flow**: Fully implemented with Prisma, Resend, and double opt-in. See `APPLY_FLOW.md` for complete documentation.

## Application Flow (Phase 2 - Complete)

The project application flow is fully implemented:

- ✅ **Database**: PostgreSQL with Prisma ORM
- ✅ **Email**: Resend integration with confirmation emails
- ✅ **Double Opt-in**: Confirmation page at `/apply/confirm`
- ✅ **Security**: Honeypot field, rate limiting, server-side validation
- ✅ **API Routes**: `/api/applications` (POST) and `/api/applications/confirm` (POST)

**Setup Required:**
1. Create PostgreSQL database
2. Set `DATABASE_URL` in `.env`
3. Set `RESEND_API_KEY` in `.env`
4. Run `npx prisma migrate dev` to create tables
5. See `APPLY_FLOW.md` for detailed setup instructions

Ready to continue building in Cursor!

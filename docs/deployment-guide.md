# Deployment Guide - Auto Quotation v2.0.0

Last Updated: 2026-03-14 | Version: 2.0.0 (Multi-Tenant SaaS with Better Auth + Drizzle)

## Overview

Auto Quotation v2.0.0 is designed for deployment on Vercel with PostgreSQL (Neon), Drizzle ORM, and Better Auth for authentication. This guide covers local development setup, testing, and production deployment.

## Prerequisites

### Required
- Node.js 18.17+ or higher
- pnpm 8+ (package manager)
- Git
- Vercel account
- Neon account (PostgreSQL serverless)

### Optional
- Docker (for local database testing)
- Vercel CLI (`npm install -g vercel`)

## Local Development Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd auto-quotation
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Create Environment File

```bash
cp .env.example .env
```

Or create manually with these variables:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET="your-random-secret-key-32-chars-min"
BETTER_AUTH_URL="http://localhost:3000"

# Vercel Blob (for logo uploads - optional for local dev)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# App configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Initialize Database

#### Option A: Using Neon (Recommended)

1. Create account at [neon.tech](https://neon.tech)
2. Create new project and database
3. Copy connection string to `DATABASE_URL`
4. Push schema:

```bash
pnpm drizzle-kit push:pg
```

5. Seed sample data:

```bash
pnpm db:seed
```

#### Option B: Local PostgreSQL with Docker

```bash
# Start PostgreSQL 15
docker run --name auto-quotation-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=auto_quotation \
  -p 5432:5432 \
  -d postgres:15

# Set DATABASE_URL
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/auto_quotation"

# Push schema and seed
pnpm drizzle-kit push:pg
pnpm db:seed
```

### 5. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Deployment on Vercel

### 1. Connect Repository to Vercel

#### Via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import repository
4. Select `auto-quotation` project
5. Vercel auto-detects Next.js

#### Via Vercel CLI
```bash
npm install -g vercel
vercel
# Follow prompts
```

### 2. Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables:

```env
DATABASE_URL=postgresql://user@ep-xxx-pooler.us-east-1.aws.neon.tech/dbname?sslmode=require
BETTER_AUTH_SECRET=your-random-secret-key-32-chars-min
BETTER_AUTH_URL=https://your-domain.com
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

**Important Notes:**
- Use Neon's **pooling** endpoint (ends with `-pooler`)
- `BETTER_AUTH_SECRET` should be a random 32+ character string
- `BETTER_AUTH_URL` must match your production domain

### 3. Database Setup on Neon

1. Create Neon account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy **pooling** connection string (not direct connection)
4. Add to Vercel as `DATABASE_URL`

### 4. Push Schema to Production

Option A: Using Neon console directly

1. Log in to Neon console
2. Navigate to SQL editor
3. Create tables manually or run migration script

Option B: Push from local environment

```bash
# Set production DATABASE_URL temporarily
export DATABASE_URL="your_production_url_here"

# Push schema
pnpm drizzle-kit push:pg

# Restore local DATABASE_URL
```

Option C: Seed initial data

```bash
pnpm db:seed
```

### 5. Configure Custom Domain (Optional)

1. In Vercel project settings → Domains
2. Add custom domain
3. Follow DNS configuration
4. SSL auto-generated

## Database Migrations (Drizzle)

### Creating Schema Changes

1. Edit schema files in `src/db/schema/`
2. Generate migration:

```bash
pnpm drizzle-kit generate:pg
```

3. Review migration in `drizzle/` directory
4. Apply locally:

```bash
pnpm drizzle-kit push:pg
```

### Deploying Migrations to Production

```bash
# With production DATABASE_URL
export DATABASE_URL="your_production_url"
pnpm drizzle-kit push:pg
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (Neon pooling endpoint) |
| `BETTER_AUTH_SECRET` | Yes | Random 32+ char secret for session encryption |
| `BETTER_AUTH_URL` | Yes | Your application URL (for auth callbacks) |
| `BLOB_READ_WRITE_TOKEN` | No | Vercel Blob token for logo uploads |
| `NEXT_PUBLIC_APP_URL` | No | Public app URL (for social sharing, emails) |

## Build & Test Locally

### Verify Production Build

```bash
pnpm build
pnpm start
```

This mimics Vercel's production build process. Test functionality:
- Sign up / login
- Create quote
- Export PDF
- Upload logo

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing: `pnpm test`
- [ ] Linting clean: `pnpm lint`
- [ ] Build succeeds: `pnpm build`
- [ ] All env vars configured in Vercel
- [ ] Database migration reviewed
- [ ] Better Auth secret generated (32+ chars)
- [ ] Neon connection tested

### Post-Deployment

- [ ] Visit production URL
- [ ] Test user registration
- [ ] Test user login
- [ ] Create quote as logged-in user
- [ ] Export PDF
- [ ] Test invite flow
- [ ] Check mobile responsiveness
- [ ] Monitor logs for 24 hours

## Monitoring & Logs

### Vercel Logs

```bash
vercel logs [project-url]
```

Or in Vercel Dashboard → Deployments → Select deployment → View Logs

### Error Tracking

Monitor errors in:
1. Vercel Dashboard → Project → Deployments tab
2. Browser console for client errors
3. Application logs for server errors

## Rollback Procedure

If deployment causes issues:

```bash
# Via Vercel Dashboard
# Select project → Deployments → Find stable version → Promote to Production

# Via CLI
vercel rollback

# Manual: Revert commit and push
git revert HEAD
git push origin main
```

## Scaling & Performance

### Current Infrastructure Limits

- **Vercel:** Unlimited serverless functions (auto-scale)
- **Neon:** Auto-scaling database (connection pooling)
- **Blob:** Unlimited storage

### Performance Monitoring

```bash
# Check production build size
pnpm build --analyze

# Monitor Core Web Vitals
# Use Vercel Analytics (built-in)

# Database performance
# Monitor via Neon console: query logs, connection count
```

## Security

### Required Checks

- [ ] `.env` file never committed to git
- [ ] `BETTER_AUTH_SECRET` is random 32+ chars
- [ ] `DATABASE_URL` uses `sslmode=require`
- [ ] Blob token has read/write permissions only
- [ ] Error messages don't leak internal details
- [ ] All API routes validate input with Zod

### HTTPS

- Enforced by Vercel automatically
- Auto-generated SSL certificates

## Troubleshooting

### Build Fails: "Drizzle command not found"

Ensure Drizzle CLI is in dependencies:

```bash
pnpm install -D drizzle-kit
```

### Database Connection Error

Check:
1. `DATABASE_URL` uses pooling endpoint (ends with `-pooler`)
2. `?sslmode=require` is included
3. IP whitelist configured in Neon (if applicable)

### Better Auth Not Working

Verify:
1. `BETTER_AUTH_SECRET` is 32+ random characters
2. `BETTER_AUTH_URL` matches your domain exactly
3. Session table exists (run `pnpm drizzle-kit push:pg`)

### Logo Upload Fails

Check:
1. `BLOB_READ_WRITE_TOKEN` is set in Vercel
2. Token is valid and has read/write permissions
3. Regenerate token in Vercel dashboard if needed

## Disaster Recovery

### Database Backup

Neon provides:
- Automatic daily backups (7-day retention)
- Point-in-time recovery
- Manual backups via console

### Restore Backup

1. Neon console → Project → Backups
2. Select backup date
3. Click "Restore"
4. Update `DATABASE_URL` to restored branch

## Performance Targets (v2.0.0)

- Quote creation: < 2 seconds
- PDF generation: < 5 seconds
- Page load: < 1.5 seconds (cached)
- API response: < 100ms (p95)
- Database queries: optimized (no N+1)
- Multi-tenant isolation: no cross-tenant leaks

## Commands Reference

```bash
# Development
pnpm dev                        # Start dev server

# Building
pnpm build                      # Build for production
pnpm start                      # Run production server

# Database
pnpm drizzle-kit generate:pg   # Generate migration
pnpm drizzle-kit push:pg       # Apply schema
pnpm db:seed                    # Seed sample data

# Quality
pnpm lint                       # Check linting
pnpm test                       # Run tests

# Deployment
vercel                          # Deploy
vercel --prod                   # Deploy to production
vercel logs                     # View logs
vercel rollback                 # Rollback to previous
```

## Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Neon Docs:** https://neon.tech/docs
- **Drizzle Docs:** https://orm.drizzle.team/docs
- **Better Auth Docs:** https://www.better-auth.com/docs
- **Next.js Docs:** https://nextjs.org/docs

---

**Last Updated:** 2026-03-14 | **Next Review:** 2026-04-14

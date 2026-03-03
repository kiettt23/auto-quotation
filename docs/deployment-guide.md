# Deployment Guide - Auto Quotation

Last Updated: 2026-03-03

## Overview

Auto Quotation is designed for deployment on Vercel with PostgreSQL (Neon) as the database and Vercel Blob for file storage. This guide covers local development setup, staging, and production deployment.

## Prerequisites

### Required
- Node.js 18.17+ or higher
- pnpm 8+ (package manager)
- Git
- Vercel account
- Neon account (or PostgreSQL database)

### Optional
- Docker (for local database)
- Vercel CLI (`npm install -g vercel`)
- Prisma Studio (included in pnpm dependencies)

## Development Environment Setup

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

Copy the example environment file:

```bash
cp .env.example .env
```

Or create manually:

```env
# Database connection string (from Neon or local PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/auto_quotation"

# Vercel Blob storage token (optional for local dev)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# Next.js app URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Initialize Database

#### Option A: Using Neon (Recommended)

1. Create account at [neon.tech](https://neon.tech)
2. Create a new project and database
3. Copy connection string to `DATABASE_URL`
4. Push schema and seed data:

```bash
pnpm db:push
pnpm db:seed
```

#### Option B: Local PostgreSQL with Docker

```bash
# Start PostgreSQL container
docker run --name auto-quotation-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=auto_quotation \
  -p 5432:5432 \
  -d postgres:15

# Set DATABASE_URL
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/auto_quotation"

# Push schema and seed
pnpm db:push
pnpm db:seed
```

### 5. Configure File Storage

For local development, Blob storage is optional. For full functionality:

1. Create Vercel account
2. Create a Blob storage token
3. Add to `.env`:

```env
BLOB_READ_WRITE_TOKEN="your_token_here"
```

### 6. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing Deployment Locally

### Build Production Version

```bash
pnpm build
pnpm start
```

This mimics Vercel's production build process.

## Production Deployment on Vercel

### 1. Connect Repository to Vercel

#### Via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import repository (GitHub, GitLab, Bitbucket)
4. Select `auto-quotation` project
5. Vercel auto-detects Next.js settings

#### Via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# In project directory
vercel
# Follow prompts to create/link project
```

### 2. Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```env
DATABASE_URL=postgresql://user:password@host/db?sslmode=require
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 3. Database Setup on Neon

1. Create Neon account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string (includes pooling endpoint for serverless)
4. Add to Vercel environment variables as `DATABASE_URL`

**Important:** Use the "pooling" connection string for Vercel (not direct connection).

### 4. Run Migrations on Vercel

After deploying, run migrations:

```bash
# Via Vercel CLI
vercel env pull .env.production.local
vercel run pnpm db:push
```

Or manually:

1. SSH into Vercel function (temporary)
2. Run `pnpm db:push`

**Recommended:** Use Neon console to manage schema directly, or run locally then deploy.

### 5. Seed Production Data

```bash
# With production DATABASE_URL configured
pnpm db:seed
```

Or seed manually via Neon console.

### 6. Configure Custom Domain (Optional)

1. In Vercel project settings → Domains
2. Add custom domain
3. Follow DNS configuration instructions
4. SSL certificate auto-generated

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (Neon or self-hosted) |
| `BLOB_READ_WRITE_TOKEN` | No | Vercel Blob token for logo uploads |
| `NEXT_PUBLIC_APP_URL` | No | Application URL (for social sharing, emails) |

### Getting Neon Connection String

1. Login to [neon.tech](https://neon.tech)
2. Select project
3. Copy "Connection string"
4. Select "Pooling enabled" option (required for Vercel)

### Getting Vercel Blob Token

1. In Vercel Dashboard → Settings → Integrations
2. Find "Blob Storage"
3. Create new token (read + write)
4. Copy token to environment variables

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing: `pnpm test`
- [ ] Linting clean: `pnpm lint`
- [ ] Build succeeds locally: `pnpm build`
- [ ] `.env` has all required variables
- [ ] Database migrations planned
- [ ] Backup of current database (if updating existing)
- [ ] Deployment runbook reviewed

### Deployment Steps

1. [ ] Push changes to main branch
2. [ ] Monitor Vercel build in dashboard
3. [ ] Verify build succeeds (status = "Ready")
4. [ ] Check environment variables are set
5. [ ] Run database migrations if needed
6. [ ] Run smoke tests on staging URL
7. [ ] Check logs for errors: `vercel logs`

### Post-Deployment

- [ ] Visit production URL and verify functionality
- [ ] Test quote creation → PDF export
- [ ] Test product management
- [ ] Check mobile responsiveness
- [ ] Verify error handling (try invalid quote ID)
- [ ] Check performance with Lighthouse
- [ ] Monitor error logs for 24 hours
- [ ] Notify stakeholders of deployment

## Database Migrations

### Creating Migrations

```bash
# Make schema changes in prisma/schema.prisma
# Then create migration:
pnpm db:migrate

# Name the migration descriptively
# Example: "add_quote_status_history"

# Push to remote database
pnpm db:push
```

### Deploying Migrations

1. **Development:** Automatic via `pnpm dev`
2. **Staging:** Manual via `pnpm db:push`
3. **Production:**
   - Via Neon console (recommended)
   - Or locally: Set `DATABASE_URL` to production, run `pnpm db:push`
   - Or via Vercel: See "Run Migrations on Vercel" section above

### Rolling Back Migrations

Prisma doesn't support automatic rollbacks. To revert:

1. Revert schema change in `prisma/schema.prisma`
2. Create new migration: `pnpm db:migrate`
3. Review and apply migration

**Tip:** Test all migrations locally first with copy of production data.

## Monitoring & Logs

### Vercel Logs

View deployment logs in Vercel Dashboard:
1. Select project
2. Click "Deployments" tab
3. Select deployment
4. Click "View Logs"

Or via CLI:

```bash
vercel logs [deployment-url]
```

### Application Logs

Function logs appear in Vercel Deployments tab. For custom logging:

```typescript
// In API routes or server actions
console.log("Event happened", { userId, quoteId });  // Appears in logs
```

### Error Tracking

Monitor errors in browser console or Vercel error tab. For production error tracking, integrate:

- **Sentry:** For JavaScript errors and performance
- **LogRocket:** For session replay and error context
- **Datadog:** For infrastructure and app metrics

## Performance Optimization

### Vercel Optimization

1. **Automatic Code Splitting:** Next.js + Vercel optimize bundles
2. **Image Optimization:** Use `next/image` for responsive images
3. **Static Generation:** Use `generateStaticParams()` where possible
4. **ISR:** Incremental Static Regeneration for semi-dynamic content

### Database Performance

```typescript
// Good: Specific field selection and relations
const quotes = await db.quote.findMany({
  select: {
    id: true,
    quoteNumber: true,
    customerId: true,
  },
  where: { status: "DRAFT" },
  take: 100,
});

// Bad: Fetching all fields and relations
const quotes = await db.quote.findMany();
```

### Monitoring Performance

```bash
# Check bundle size
npx next build --analyze

# Test with Lighthouse
npm audit
```

## Scaling Considerations

### Current Limits (Phase 1)

- **Vercel:** 12 concurrent serverless function executions
- **Neon:** Serverless auto-scaling (no limit)
- **Blob:** Unlimited storage

### When to Scale (Phase 2+)

- **100+ QPS (queries per second):** Add caching layer (Redis)
- **10TB+ data:** Database partitioning or sharding
- **1000+ concurrent users:** Add Vercel Pro/Enterprise

## Disaster Recovery

### Database Backup

Neon provides automatic backups:
- Automatic daily backups (7 days retention)
- Point-in-time recovery (up to 7 days)
- Manual backups via Neon console

```bash
# Manual backup (export)
pg_dump "$DATABASE_URL" > backup-$(date +%Y%m%d).sql
```

### Restore from Backup

1. In Neon console → Project → Backups
2. Select backup date
3. Click "Restore"
4. New branch created with data
5. Update `DATABASE_URL` to point to restored branch

### Recovery Procedures

**Scenario: Accidental Data Deletion**

1. Identify when deletion occurred (check timestamps)
2. Use Neon point-in-time recovery
3. Restore to point before deletion
4. Export affected data
5. Import into current database

**Scenario: Deployment Failed**

1. Revert to last stable deployment: `vercel rollback`
2. Fix issue in code
3. Redeploy: `git push main`

## Security Checklist

- [ ] `.env` file in `.gitignore` (never commit secrets)
- [ ] All API routes validate input (Zod schemas)
- [ ] Database connection uses SSL (`sslmode=require`)
- [ ] Blob token has minimal permissions (read/write only)
- [ ] Error messages don't leak internal details
- [ ] CORS configured if needed
- [ ] Rate limiting added to API routes (Phase 2)
- [ ] Audit logging for sensitive operations (Phase 2)

## Troubleshooting

### Build Fails on Vercel

**Error:** "Command 'pnpm' not found"

Solution: Vercel supports pnpm. Check project settings → Build & Development Settings → Build command.

```
Build Command: pnpm build
Install Command: pnpm install
```

**Error:** "Prisma client generation failed"

Solution: Ensure `prisma/schema.prisma` is valid.

```bash
npx prisma validate
```

### Database Connection Errors

**Error:** "connect ECONNREFUSED 127.0.0.1:5432"

Solution: Check `DATABASE_URL` is correct. For Neon, use pooling endpoint.

```
# Wrong (direct connection)
postgresql://user@ep-xxx.us-east-1.aws.neon.tech/dbname

# Correct (pooling)
postgresql://user@ep-xxx-pooler.us-east-1.aws.neon.tech/dbname?sslmode=require
```

### PDF Export Fails

**Error:** "Font not found: Roboto"

Solution: Fonts must exist in `/public/fonts/` (included in repo).

Verify:
```bash
ls public/fonts/
# Should show: Roboto-Regular.ttf, Roboto-Bold.ttf
```

### Blob Upload Fails

**Error:** "Unauthorized: BLOB_READ_WRITE_TOKEN"

Solution: Token invalid or missing. Regenerate in Vercel dashboard.

```
Settings → Integrations → Blob Storage → Create New Token
```

## Maintenance

### Regular Tasks

| Task | Frequency | Command |
|------|-----------|---------|
| Monitor logs | Daily | `vercel logs` |
| Check alerts | Daily | Vercel Dashboard |
| Database backup verification | Weekly | Neon console |
| Dependency updates | Monthly | `pnpm update --latest` |
| Security audit | Monthly | `npm audit` |
| Performance review | Monthly | Lighthouse, Vercel Analytics |

### Updating Dependencies

```bash
# Check for updates
pnpm outdated

# Update minor versions (safe)
pnpm update

# Update major versions (test first!)
pnpm update --latest
pnpm build
pnpm test
```

### Database Maintenance

```bash
# Analyze query performance
pnpm db:studio  # Open Prisma Studio

# Check database stats (Neon console)
# Monitor: connection count, query performance, storage

# Cleanup old data (if needed)
# Use Neon console or direct SQL queries
```

## Downtime Prevention

### Zero-Downtime Deployment

Vercel handles this automatically:
1. New version deployed to isolated container
2. Health check passes
3. Traffic gradually shifted to new version
4. Old version kept running briefly (rollback ready)

### Blue-Green Deployment

For critical updates:

1. Deploy to staging branch
2. Test thoroughly
3. Merge to main and deploy
4. Keep previous deployment ready via `vercel rollback`

### Health Checks

Monitor with:

```typescript
// src/app/api/health/route.ts
export async function GET() {
  try {
    // Check database
    await db.settings.findUnique({ where: { id: "default" } });

    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ status: "error" }), {
      status: 500,
    });
  }
}
```

External monitoring (Phase 2):
- Uptime Robot for `/api/health`
- Alerts to Slack/email on failures

## Rollback Procedure

If deployment fails or causes issues:

```bash
# Via Vercel Dashboard
# Select project → Deployments → Find stable version → Click "..." → Promote to Production

# Via CLI
vercel rollback

# Manual: Revert git commit and push
git revert HEAD
git push origin main
```

## Cost Optimization

### Vercel Costs
- **Free tier:** 100 GB bandwidth/month, ample for MVP
- **Pro:** $20/month for additional features
- **Enterprise:** For 1000+ QPS

Current estimated: **$0-20/month**

### Neon Costs
- **Free tier:** 500MB storage, 5 connections
- **Starter:** $14/month for unlimited storage
- **Pro:** Custom pricing for high throughput

Current estimated: **$0-20/month** (free tier sufficient for Phase 1)

### Optimization Tips

1. Optimize database queries (avoid N+1)
2. Use image optimization (`next/image`)
3. Compress assets
4. Use edge caching where possible
5. Monitor connection usage

## Useful Commands

```bash
# Local development
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm start                  # Run production server

# Database
pnpm db:migrate            # Create migration
pnpm db:push               # Apply schema to database
pnpm db:studio             # Open visual editor
pnpm db:seed               # Seed with sample data
pnpm db:generate           # Regenerate Prisma client

# Quality
pnpm lint                  # Check linting
pnpm test                  # Run tests

# Deployment
vercel                     # Deploy to Vercel
vercel --prod              # Deploy to production
vercel logs                # View logs
vercel rollback            # Rollback to previous version
```

## Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Neon Docs:** https://neon.tech/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **GitHub Issues:** For bug reports and discussions

## Document History

| Date | Author | Changes |
|------|--------|---------|
| 2026-03-03 | Dev Team | Initial deployment guide |

## Related Documentation

- [README.md](../README.md) - Quick start
- [System Architecture](./system-architecture.md) - Technical design
- [Code Standards](./code-standards.md) - Development guidelines

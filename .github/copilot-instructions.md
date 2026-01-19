# Copilot Instructions for LawEthic

## Architecture Overview
- **Monorepo** via npm workspaces: Next.js 14 App Router at `apps/web`, shared Appwrite SDK at `packages/appwrite`
- **Single app, two flows**: Customer portal (`/services`, `/checkout`, `/dashboard`) and Admin panel (`/admin/*`)
- **Backend stack**: Appwrite Cloud (auth/database/storage), Razorpay (payments), Resend (emails)
- **Path aliases**: `@/*` maps to `apps/web/*` (see [apps/web/tsconfig.json](apps/web/tsconfig.json))

## Commands (run from repo root)
```bash
npm install && npm run dev:web   # Install + dev server on localhost:3000
npm run build:web && npm run lint # Production build + lint
npm run seed                     # Seed Appwrite (requires APPWRITE_API_KEY)
npm run setup-service-content    # Set up service content collection
```

## Environment Setup
- Copy `apps/web/.env.example` to `apps/web/.env.local`
- Required vars: `NEXT_PUBLIC_APPWRITE_*`, `APPWRITE_API_KEY` (server only), `RAZORPAY_*`, `RESEND_API_KEY`
- Collection/bucket IDs default to standard names — see [packages/appwrite/config.ts](packages/appwrite/config.ts)
- Dev email testing: set `EMAIL_SEND_TO_REAL_USERS=false` (default) to redirect all mail to `RESEND_TEST_EMAIL`

## Appwrite SDK Pattern (Critical)
| Context | Import | Package |
|---------|--------|---------|
| Client components | `@lawethic/appwrite/client` | Browser SDK (`appwrite`) |
| API routes/server | `@lawethic/appwrite/server` | Node SDK (`node-appwrite`) |

```typescript
// Server-side (API routes)
import { serverDatabases, serverStorage } from '@lawethic/appwrite/server';
import { appwriteConfig } from '@lawethic/appwrite/config';

// Client-side (components with 'use client')
import { databases, account, storage, client } from '@lawethic/appwrite/client';
import { Query, ID } from 'appwrite';
```

- Config/IDs: [packages/appwrite/config.ts](packages/appwrite/config.ts) — exports `appwriteConfig.collections.*` and `appwriteConfig.buckets.*`
- Types: [packages/appwrite/types.ts](packages/appwrite/types.ts) — `UserRole`, `OrderStatus`, `DocumentStatus`, `ConsultationStatus`, etc.

## Auth & Roles
- Roles stored in Appwrite user prefs: `customer` | `operations` | `admin`
- **Client-side protection**: wrap with `<RoleGuard allowedRoles={['admin']}>` — see [components/RoleGuard.tsx](apps/web/components/RoleGuard.tsx)
- **Middleware**: pass-through only ([middleware.ts](apps/web/middleware.ts)) — client-side `RoleGuard` handles redirects
- **All admin pages are client components** — they use `'use client'` directive and `RoleGuard` for protection

## File Uploads (Critical Workaround)
Node SDK `storage.createFile()` **fails** in Next.js API routes. Use manual multipart fetch:
```typescript
const boundary = `----WebKitFormBoundary${Math.random().toString(36).substring(2)}`;
const headerParts = `--${boundary}\r\nContent-Disposition: form-data; name="fileId"\r\n\r\n${fileId}\r\n--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: application/pdf\r\n\r\n`;
const bodyBuffer = Buffer.concat([Buffer.from(headerParts), pdfBuffer, Buffer.from(`\r\n--${boundary}--\r\n`)]);
await fetch(`${appwriteConfig.endpoint}/storage/buckets/${bucketId}/files`, {
  method: 'POST',
  headers: { 'X-Appwrite-Project': appwriteConfig.project, 'X-Appwrite-Key': apiKey, 'Content-Type': `multipart/form-data; boundary=${boundary}` },
  body: bodyBuffer
});
```
Reference: [lib/invoice/invoice-generator.ts](apps/web/lib/invoice/invoice-generator.ts#L173-L210)

## Service Data (Dual Source Pattern)
Services come from **Appwrite DB** (dynamic) OR **static registry** (fallback). Always implement fallback:
```typescript
import { getServiceBySlug, getAllServices } from '@/data/services';
// Primary: try Appwrite, Fallback: static registry
const staticService = getServiceBySlug(slug);
```
Static registry: [apps/web/data/services/index.ts](apps/web/data/services/index.ts) (~2800 lines) — contains all services, packages, FAQs, process steps. Types like `ServicePackage`, `ProcessStep`, `FAQ` defined at top.

## Notifications & Emails
- **Notifications**: [lib/notifications/notification-service.ts](apps/web/lib/notifications/notification-service.ts)
  - Helpers: `notifyNewMessage()`, `notifyStatusChange()`, `notifyDocumentVerified()`, `notifyDocumentRejected()`, `notifyCertificateReady()`
  - All POST to `/api/notifications/create`
- **Emails**: [lib/email/email-service.ts](apps/web/lib/email/email-service.ts) wraps Resend
  - Templates: `sendInvoiceEmail()`, `sendQuestionnaireEmail()`, `sendWelcomeEmail()`
  - Dev mode redirects to `RESEND_TEST_EMAIL` unless `EMAIL_SEND_TO_REAL_USERS=true`

## Order & Document Lifecycle
```
Order:  new → pending_docs → in_review → ready_for_filing → submitted → pending_approval → completed (or on_hold)
Document: pending → verified | rejected
Consultation: submitted → under_review → pending_assignment → meeting_scheduled → meeting_completed → recommendations_sent → converted | closed
```
- Questionnaires: dynamic forms stored in `questionnaire_requests` collection
- Government fees: tracked in `government_fee_requests` collection

## UI Conventions
- **Components**: shadcn/ui in [apps/web/components/ui](apps/web/components/ui)
- **Styling**: Tailwind CSS — use `cn()` from `@/lib/utils` for conditional classes
- **Icons**: Lucide React (`import { Icon } from 'lucide-react'`)
- **Toasts**: Use `toast` from `sonner` for notifications
- **Client components**: MUST have `'use client'` directive at file top

## API Route Structure
All API routes under `apps/web/app/api/`:
- `/admin/*` — admin operations (no server-side role verification)
- `/messages/*` — chat/messaging (verifies sender access per order/consultation)
- `/notifications/*` — create/mark-read notifications
- `/payment/*` — Razorpay integration
- `/invoices/*` — invoice generation/download
- `/questionnaires/*` — dynamic form management
- `/consultations/*` — consultation booking/management
- `/availability/*` — expert scheduling

## Known Security Gaps
- `/api/admin/*` routes lack server-side role checks (relies on client `RoleGuard`)
- `/api/invoices/download/[id]` has no ownership verification
- Add server-side auth validation before production deployment

## Deployment (Vercel)
- [vercel.json](vercel.json): `buildCommand: npm run build:web`, output: `apps/web/.next`
- Monorepo workspace commands handle build from root


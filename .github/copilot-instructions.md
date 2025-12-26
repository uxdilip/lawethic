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
npm run update-permissions       # Update Appwrite collection permissions
npm run test-document            # Test document operations
```

## Environment Setup
- Copy `apps/web/.env.example` to `apps/web/.env.local`
- Required vars: `NEXT_PUBLIC_APPWRITE_*`, `APPWRITE_API_KEY` (server only), `RAZORPAY_*`, `RESEND_API_KEY`
- Collection/bucket IDs default to standard names (users, services, orders, etc.) — override with env vars if needed
- Dev email testing: set `RESEND_TEST_EMAIL` to catch all outbound mail

## Appwrite SDK Pattern (Critical)
| Context | Import | Package |
|---------|--------|---------|
| Client components | `@lawethic/appwrite` | Browser SDK (`appwrite`) |
| API routes/server | `@lawethic/appwrite/server` | Node SDK (`node-appwrite`) |

- Config/IDs: [packages/appwrite/config.ts](packages/appwrite/config.ts)
- Types: [packages/appwrite/types.ts](packages/appwrite/types.ts)
- Server exports: `serverDatabases`, `serverStorage`, `serverAccount` from `@lawethic/appwrite/server`
- All client components **must** have `'use client'` directive

## Auth & Roles
- Roles in Appwrite user prefs: `customer` | `operations` | `admin` (see [packages/appwrite/types.ts](packages/appwrite/types.ts))
- **Client-side**: wrap with `<RoleGuard allowedRoles={['admin']}>` (see [components/RoleGuard.tsx](apps/web/components/RoleGuard.tsx))
- **Middleware**: intentionally pass-through — client handles auth redirects
- **API routes**: parse session cookie manually (Next.js `cookies()` helper breaks with Appwrite):
  ```typescript
  const cookieHeader = request.headers.get('cookie');
  const cookies = cookieHeader.split(';').reduce((acc, c) => {
    const [name, value] = c.trim().split('=');
    acc[name] = value;
    return acc;
  }, {} as Record<string, string>);
  const sessionCookieName = Object.keys(cookies).find(n => n.startsWith('a_session_'));
  ```
  Reference: [app/api/messages/send/route.ts](apps/web/app/api/messages/send/route.ts#L22-L56)

## File Uploads (Critical Workaround)
Node SDK `storage.createFile()` **breaks** in Next.js API routes. Use manual multipart fetch:
```typescript
const boundary = `----WebKitFormBoundary${Math.random().toString(36).substring(2)}`;
const headerParts = `--${boundary}\r\nContent-Disposition: form-data; name="fileId"\r\n\r\n${fileId}\r\n--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: application/pdf\r\n\r\n`;
const bodyBuffer = Buffer.concat([Buffer.from(headerParts), pdfBuffer, Buffer.from(`\r\n--${boundary}--\r\n`)]);
await fetch(`${endpoint}/storage/buckets/${bucketId}/files`, {
  method: 'POST',
  headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey, 'Content-Type': `multipart/form-data; boundary=${boundary}` },
  body: bodyBuffer
});
```
Reference: [lib/invoice/invoice-generator.ts](apps/web/lib/invoice/invoice-generator.ts#L173-L210)

## Service Data (Dual Source)
Services come from **Appwrite DB** (dynamic) OR **static registry** (fallback). Always use fallback pattern:
```typescript
import { getServiceBySlug } from '@/data/services';
// Try Appwrite first, fallback to static registry
const staticService = getServiceBySlug(serviceId);
```
Static registry: [apps/web/data/services/index.ts](apps/web/data/services/index.ts) (~2500 lines, all services/packages/FAQs defined)

## Notifications & Emails
- **Notifications**: Use helpers from [lib/notifications/notification-service.ts](apps/web/lib/notifications/notification-service.ts)
  - `notifyNewMessage()`, `notifyStatusChange()`, `notifyDocumentVerified()`, etc.
  - All route to `/api/notifications/create`
- **Emails**: [lib/email/email-service.ts](apps/web/lib/email/email-service.ts) wraps Resend
  - Dev mode: all mail routes to `RESEND_TEST_EMAIL`
  - Templates: `sendInvoiceEmail()`, `sendQuestionnaireEmail()`, etc.

## Order & Document Lifecycle
- **Order statuses**: `new` → `pending_docs` → `in_review` → `ready_for_filing` → `submitted` → `pending_approval` → `completed` (or `on_hold`)
- **Document statuses**: `pending` → `verified` | `rejected`
- **Questionnaires**: Dynamic forms sent via admin panel, stored in `questionnaire_requests` collection

## UI Stack
- **Components**: shadcn/ui in [apps/web/components/ui](apps/web/components/ui)
- **Styling**: Tailwind CSS — use `cn()` from `@/lib/utils` for conditional classes
- **Icons**: Lucide React (`import { Icon } from 'lucide-react'`)
- All client components need `'use client'` directive at top

## Deployment (Vercel)
- Config: [vercel.json](vercel.json) specifies `buildCommand: npm run build:web`
- Build output: `apps/web/.next`
- Monorepo setup: workspace commands handle build from root

## Known Security Gaps (fix when extending)
- `/api/admin/*` routes — no server-side role checks (client `RoleGuard` only)
- `/api/invoices/download/[id]` — no ownership verification
- `middleware.ts` — passes all requests (intentional, client-side gating)
- Consider server-side auth for sensitive APIs before production


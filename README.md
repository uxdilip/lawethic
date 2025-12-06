# LawEthic - Compliance Services Platform

A traditional (non-AI) compliance services platform for GST Registration, Trademark Filing, Company Registration, and more. Built with Next.js, TypeScript, and Appwrite.

## 🏗️ Project Structure

```
lawethic/
├── apps/
│   ├── web/                    # Customer-facing Next.js app
│   └── admin/                  # Admin/Operations dashboard
├── packages/
│   └── appwrite/              # Shared Appwrite configuration
├── appwrite-functions/        # Serverless functions (Phase 2)
└── docs/                      # Documentation
```

## 🚀 Phase 1 Features (Completed)

### Customer App (`apps/web`)
- ✅ Landing page with service showcase
- ✅ Service listing and detail pages
- ✅ Email/Password authentication (signup/login)
- ✅ Customer dashboard
- ✅ Multi-step checkout flow:
  - Service details form
  - Document upload
  - Order confirmation
- ✅ Order tracking (basic)

### Admin App (`apps/admin`)
- ✅ Admin login page (placeholder)
- ✅ Cases dashboard (skeleton)
- ✅ Sidebar navigation

### Shared Package
- ✅ Appwrite client configuration
- ✅ TypeScript types for all entities
- ✅ Database and storage helpers

## 📋 Prerequisites

- Node.js 18+ and npm 8+
- Appwrite Cloud account or self-hosted Appwrite instance
- (Optional) Razorpay account (for Phase 2)

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
# Install all dependencies
npm install
```

### 2. Set Up Appwrite

Follow the detailed instructions in `APPWRITE_SETUP.md` to:
- Create an Appwrite project
- Set up database collections
- Configure storage buckets
- Create teams and set permissions
- Seed initial data

### 3. Configure Environment Variables

#### For `apps/web`:
```bash
cd apps/web
cp .env.example .env.local
```

Edit `.env.local` with your Appwrite credentials:
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=your-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=main
# ... (see .env.example for all variables)
```

#### For `apps/admin`:
```bash
cd apps/admin
cp .env.example .env.local
```

Edit with the same Appwrite credentials.

### 4. Run Development Servers

#### Run both apps:
```bash
npm run dev
```

#### Or run individually:
```bash
# Customer app (localhost:3000)
npm run dev:web

# Admin app (localhost:3001)
npm run dev:admin
```

## 📚 Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **React Hook Form + Zod** - Form handling and validation

### Backend
- **Appwrite** - Backend as a Service
  - Authentication
  - Database (PostgreSQL)
  - Storage
  - Functions (serverless)
  - Realtime

### Infrastructure
- **npm Workspaces** - Monorepo management
- **Vercel/Netlify** - Deployment (recommended)

## 🗂️ Database Collections

See `APPWRITE_SETUP.md` for detailed schema.

- **services** - Available compliance services
- **orders** - Customer orders
- **documents** - Uploaded files metadata
- **notifications** - In-app notifications
- **messages** - Chat messages between customer and ops
- **payments** - Payment records (Phase 2)
- **order_timeline** - Status change history

## 🔐 User Roles

- **customer** - End users who order services
- **operations** - CA/CS team handling filings
- **admin** - System administrators

## 📖 User Flows

### Customer Journey
1. Browse services → Select service
2. Sign up / Login
3. Fill application form
4. Upload documents
5. Review and confirm (payment in Phase 2)
6. Track order status in dashboard
7. Download certificate when ready

### Operations Journey
1. Login to admin panel
2. View new cases
3. Review documents
4. Request additional docs if needed
5. Prepare and submit to govt portal
6. Upload certificate
7. Mark as completed

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Sign up with new email
- [ ] Login with existing account
- [ ] Logout
- [ ] Protected routes redirect to login

**Services:**
- [ ] View service list
- [ ] View service details
- [ ] Click "Start Application"

**Checkout:**
- [ ] Fill details form
- [ ] Upload documents (PDF/images)
- [ ] Create order successfully
- [ ] View order in dashboard

**Admin:**
- [ ] Login to admin panel
- [ ] View dashboard

## 🚧 Pending (Phase 2+)

- [ ] Razorpay payment integration
- [ ] Appwrite Functions for webhooks
- [ ] Email notifications
- [ ] SMS notifications (optional)
- [ ] Admin case management (full CRUD)
- [ ] Document verification workflow
- [ ] Real-time chat
- [ ] Certificate generation
- [ ] Invoice generation
- [ ] Reports and analytics

## 📝 Development Commands

```bash
# Install dependencies
npm install

# Run dev servers
npm run dev

# Build all apps
npm run build

# Lint code
npm run lint

# Clean all build artifacts
npm run clean
```

## 🐛 Troubleshooting

### TypeScript Errors
The initial TypeScript errors you see are expected before running `npm install`. After installing dependencies, all errors should resolve.

### Appwrite Connection Issues
- Verify `NEXT_PUBLIC_APPWRITE_ENDPOINT` is correct
- Check `NEXT_PUBLIC_APPWRITE_PROJECT` matches your project ID
- Ensure Appwrite project is active and accessible

### CORS Errors
Add your development URLs to Appwrite Console:
- `http://localhost:3000` (web app)
- `http://localhost:3001` (admin app)

Go to: Appwrite Console → Your Project → Settings → Platforms → Add Platform (Web App)

## 📄 License

MIT

## 👥 Contributors

Built with ❤️ by GitHub Copilot

# Admin Dashboard Setup Guide

## Overview

The LawEthic Admin Dashboard is a complete case management system for operations and admin teams to manage customer orders, verify documents, update statuses, and track progress.

## Features

### ✅ Implemented

1. **Role-Based Authentication**
   - Three roles: `customer`, `operations`, `admin`
   - Separate admin login at `/admin/login`
   - Role-based access control with RoleGuard components
   - Middleware protection for admin routes

2. **Admin Dashboard** (`/admin/dashboard`)
   - 5 KPI cards: New Orders, Payment Received, In Progress, Completed This Month, Pending Documents
   - Recent orders table with quick actions
   - Real-time statistics

3. **Cases List Page** (`/admin/cases`)
   - Comprehensive filters: Status, Payment Status, Date Range, Search
   - Search by Order ID, Customer Name, Email, Phone
   - Pagination (20 orders per page)
   - Sortable columns
   - Quick view actions

4. **Case Detail Page** (`/admin/cases/[id]`)
   - Customer information display
   - Service details
   - Documents section with verify/reject actions
   - Status update with internal notes
   - Payment information
   - Quick action buttons

5. **Document Verification Workflow**
   - View uploaded documents
   - Verify documents with one click
   - Reject documents with reason
   - Document status badges (Pending/Verified/Rejected)
   - Timeline tracking for document actions

6. **RBAC Implementation**
   - Operations can see assigned cases (when implemented)
   - Admin can see all cases + analytics
   - Customers only see their own orders
   - Role checking utilities in `packages/appwrite/auth.ts`

### 🔄 Partially Implemented

- Certificate upload section (UI placeholders created)
- Email notifications (quick action buttons created)
- Chat integration (quick action buttons created)
- Timeline view (quick action buttons created)

### ⏳ Pending

- Certificate upload functionality
- Assignment to team members
- Internal notes system
- Team management page
- Analytics page
- Customer management page

## Setup Instructions

### 1. Set User Roles

First, you need to assign roles to users. Use the provided script:

```bash
# Make admin user
tsx scripts/set-user-role.ts admin@lawethic.com admin

# Make operations user
tsx scripts/set-user-role.ts ops@lawethic.com operations

# Make customer (default for all new users)
tsx scripts/set-user-role.ts user@example.com customer
```

**Note:** Users must register first before you can assign them a role.

### 2. Access Admin Panel

1. Navigate to `/admin/login`
2. Login with an admin or operations user account
3. Customer accounts will be denied access

### 3. Admin Routes

- `/admin/login` - Admin login page
- `/admin/dashboard` - Overview with KPIs
- `/admin/cases` - All orders with filters
- `/admin/cases/[id]` - Individual case details

## File Structure

```
apps/web/
├── app/
│   ├── admin/
│   │   ├── login/page.tsx          # Admin login
│   │   ├── dashboard/page.tsx      # Admin dashboard
│   │   └── cases/
│   │       ├── page.tsx            # Cases list
│   │       └── [id]/page.tsx       # Case detail
│   └── middleware.ts               # Route protection
├── components/
│   ├── AdminLayout.tsx             # Admin navigation layout
│   └── RoleGuard.tsx               # Role-based access control

packages/appwrite/
├── auth.ts                         # Auth utilities (getUserRole, isAdmin, etc.)
├── types.ts                        # TypeScript types
└── config.ts                       # Appwrite configuration

scripts/
└── set-user-role.ts                # Script to assign user roles
```

## Usage Guide

### For Admin Users

1. **Dashboard Overview**
   - View key metrics at a glance
   - See recent orders
   - Click "View all" to see all cases

2. **Managing Cases**
   - Use filters to find specific orders
   - Search by customer name, email, or order number
   - Click "View Details" to see full case information

3. **Case Detail Page**
   - **Customer Info:** View all customer details from checkout form
   - **Documents:** Review, verify, or reject uploaded documents
   - **Status Management:** Update order status and add internal notes
   - **Payment Info:** View payment details and transaction ID

4. **Document Verification**
   - Click "View" to preview document
   - Click "✓ Verify" to approve document
   - Click "✗ Reject" to reject with reason
   - Document status updates automatically

5. **Status Updates**
   - Select new status from dropdown
   - Add optional internal note
   - Click "Update Status" to save
   - Status change is logged in timeline

### For Operations Users

- Same access as admin users for case management
- Future: Will only see assigned cases
- Can verify documents and update statuses

### Status Flow

1. **new** - Order placed, payment may be pending
2. **pending_docs** - Waiting for customer documents
3. **in_review** - Documents under review
4. **ready_for_filing** - Ready to submit to government
5. **submitted** - Submitted to government
6. **pending_approval** - Awaiting government approval
7. **completed** - Order completed
8. **on_hold** - Order on hold (issues to resolve)

## Security Features

- Middleware protection for admin routes
- Role verification on every page load
- Session-based authentication via Appwrite
- Automatic redirect to login if unauthorized
- Customer users cannot access admin panel

## Components

### RoleGuard

Protect any component based on user role:

```tsx
import { StaffOnly, AdminOnly } from '@/components/RoleGuard';

// For admin and operations
<StaffOnly>
  <AdminFeature />
</StaffOnly>

// For admin only
<AdminOnly>
  <AdminOnlyFeature />
</AdminOnly>
```

### AdminLayout

Provides consistent navigation for admin pages:

```tsx
import AdminLayout from '@/components/AdminLayout';

<AdminLayout>
  <YourContent />
</AdminLayout>
```

## API Functions

### Auth Utilities (`packages/appwrite/auth.ts`)

```typescript
import { getUserRole, isAdmin, isOperations, isStaff } from '@lawethic/appwrite/auth';

// Get user's role
const role = await getUserRole(); // 'customer' | 'operations' | 'admin'

// Check specific role
const isAdminUser = await isAdmin(); // true/false
const isOpsUser = await isOperations(); // true/false
const isStaffUser = await isStaff(); // true/false (admin or operations)
```

## Testing

### Test Admin Access

1. Create a test account
2. Set role to admin: `tsx scripts/set-user-role.ts test@example.com admin`
3. Login at `/admin/login`
4. Verify you can access all admin pages

### Test Operations Access

1. Create operations account
2. Set role: `tsx scripts/set-user-role.ts ops@example.com operations`
3. Login and verify access

### Test Customer Denial

1. Login as customer (default role)
2. Try to access `/admin/dashboard`
3. Should be redirected to login or see "Access Denied"

## Troubleshooting

### "Access Denied" Error

- Check user role: Login to Appwrite console → Auth → Users → Select user → Preferences
- Role should be `{"role": "admin"}` or `{"role": "operations"}`
- Re-run the set-user-role script if needed

### Can't See Orders

- Verify Appwrite permissions allow read access for team members
- Check that orders collection has proper permissions
- Run `tsx scripts/update-permissions.ts` if needed

### Middleware Not Working

- Clear browser cache and cookies
- Verify `NEXT_PUBLIC_APPWRITE_PROJECT` is set correctly
- Check middleware.ts is in the root of apps/web/ folder

## Next Steps

1. Implement certificate upload functionality
2. Add assignment to team members
3. Build internal notes system
4. Create team management page
5. Add analytics dashboard
6. Implement email notifications
7. Add real-time chat integration

## Support

For issues or questions, check:
- Appwrite documentation: https://appwrite.io/docs
- Next.js documentation: https://nextjs.org/docs
- Project PHASE-2.md for roadmap

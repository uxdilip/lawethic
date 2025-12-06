# Phase 2: Complete Business Flow - Payment to Delivery

## Status Overview
- **Phase Status:** In Progress
- **Completed:** 2/8 modules
- **Last Updated:** December 2, 2025

---

## 1. Payment Integration ✅ **[COMPLETED]**

### ✅ Completed Tasks

#### Razorpay Setup
- ✅ Razorpay account created (test mode)
- ✅ API keys configured in `.env.local`
  - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`

#### Frontend Implementation
- ✅ 4-step checkout flow: Details → Documents → Payment → Confirmation
- ✅ Payment order creation API (`/api/payment/create-order`)
- ✅ Razorpay checkout modal integration
- ✅ Payment verification API (`/api/payment/verify`)
- ✅ Payment signature verification (HMAC)
- ✅ Success/failure handling with proper error messages
- ✅ Redirect to dashboard after successful payment

#### Backend Implementation
- ✅ Server-side Appwrite SDK setup with API key
- ✅ Payment order creation with Razorpay
- ✅ Payment signature verification
- ✅ Order status update on successful payment
- ✅ Payment record creation in database
- ✅ Collection attributes fixed (amount, status, paymentStatus)

#### Database Updates
- ✅ Orders collection: Added `paymentId`, `paymentStatus`, `status`, `amount`
- ✅ Payments collection: Added `amount`, `status`, `method`
- ✅ Documents collection: Added `status` attribute
- ✅ Proper permissions set for all collections

#### UI/UX
- ✅ Dashboard displays payment status badges
- ✅ Order statistics (Total, In Progress, Completed, Pending)
- ✅ Orders table with payment and order status
- ✅ PaymentButton component with loading states

### ⏳ Pending Tasks
- [ ] Razorpay webhook integration for payment confirmations
- [ ] Invoice generation after successful payment
- [ ] Invoice PDF generation (pdfkit/puppeteer)
- [ ] Email invoice to customer
- [ ] Payment receipt generation
- [ ] Refund processing capability

---

## 2. Admin Dashboard - Full Case Management ✅ **[COMPLETED]**

### ✅ Completed Tasks

#### Admin Authentication & Routes
- ✅ `/admin/login` - Separate admin login page with role verification
- ✅ Role-based authentication (admin, operations, customer)
- ✅ Protected admin routes with middleware
- ✅ `/admin/dashboard` - Admin overview with KPIs
- ✅ `/admin/cases` - All orders list with filters
- ✅ `/admin/cases/[id]` - Individual case detail page
- ✅ Auth utilities (getUserRole, isAdmin, isStaff, etc.)
- ✅ RoleGuard components (StaffOnly, AdminOnly)
- ✅ Script to set user roles (set-user-role.ts)

#### Dashboard Overview Cards
- ✅ **New Orders** (pending payment): Count + total amount
- ✅ **Payment Received** (needs processing): Count
- ✅ **In Progress**: Count of active cases
- ✅ **Completed This Month**: Count + revenue
- ✅ **Pending Documents**: Count (waiting for review)
- ✅ Recent orders table with quick actions

#### Cases List Page Features
- ✅ **Table Columns:**
  - Order ID, Customer Name, Email, Phone
  - Created Date, Amount, Payment Status, Order Status
  - Quick Actions (View Details)
- ✅ **Filters:**
  - Status dropdown (All, New, In Review, Completed, etc.)
  - Payment status filter
  - Date range picker (From/To dates)
  - Search by customer name/email/order number
- ✅ **Pagination:** 20 orders per page with page numbers
- ✅ Reset filters functionality
- ✅ Results counter showing filtered vs total orders

#### Individual Case Detail Page
- ✅ **Customer Information Section:**
  - Full Name, Email, Mobile, PAN Number
  - All form data submitted during checkout
  - Address if provided
  
- ✅ **Service Details Section:**
  - Service name and description
  - Amount and estimated days
  
- ✅ **Documents Section:**
  - List all uploaded documents with status badges
  - Preview/download buttons (View Document)
  - Document status badges (Verified ✓ / Pending / Rejected ✗)
  - Action buttons: Verify, Reject (with reason prompt)
  - Rejection reason display for rejected documents
  - Upload timestamps

- ✅ **Status Management:**
  - Status dropdown with all states:
    - New
    - Pending Documents
    - In Review
    - Ready for Filing
    - Submitted
    - Pending Approval
    - Completed
    - On Hold
  - Internal note field for status changes
  - Update button with confirmation
  - Timeline entry creation on status change

- ✅ **Payment Information:**
  - Payment status display
  - Amount paid
  - Payment ID/Transaction ID
  
- ✅ **Quick Actions Sidebar:**
  - Send Email to Customer (placeholder)
  - Open Chat (placeholder)
  - Upload Certificate (placeholder)
  - View Timeline (placeholder)

#### Permissions Implementation
- ✅ Role-based access control with RoleGuard
- ✅ Middleware protection for /admin routes
- ✅ Admin: See all cases + full access
- ✅ Operations: Access to case management (admin-level for now)
- ✅ Customers: Blocked from admin panel
- ✅ Session verification on protected routes

### ⏳ Pending Tasks

#### Advanced Features
- [ ] **Certificate Upload:** Functional upload (UI placeholder exists)
- [ ] **Assignment Section:** Assign to team members, set priority, due dates
- [ ] **Internal Notes:** Persistent notes visible only to operations team
- [ ] **Bulk Actions:** Assign multiple cases, export to CSV
- [ ] **Service Type Filter:** Filter cases by service type
- [ ] **Operations View:** Operations users see only assigned cases
- [ ] **Team Management Page:** Manage team members and roles
- [ ] **Analytics Page:** Revenue trends, service performance
- [ ] **Email Integration:** Send emails from admin panel
- [ ] **Notifications:** Auto-notify customers on status changes
---

## 3. Real-Time Chat System 📝 **[PENDING]**

### Customer Side Features
- [ ] Chat icon in dashboard (bottom-right floating button)
- [ ] Click opens chat panel/modal
- [ ] See conversation history for each order
- [ ] Send text messages
- [ ] Typing indicator (when ops team is typing)
- [ ] Unread message count badge
- [ ] Message timestamps
- [ ] Auto-scroll to latest message

### Admin/Operations Side Features
- [ ] Chat panel in case detail page
- [ ] See all messages for specific order
- [ ] Reply to customer messages
- [ ] Send proactive messages ("We need your PAN card")
- [ ] Mark conversation as resolved
- [ ] Quick replies/templates
- [ ] See customer typing indicator

### Technical Implementation
- [ ] Use Appwrite Realtime subscriptions
- [ ] Subscribe to order-specific message changes
- [ ] Message collection structure:
  ```json
  {
    "orderId": "...",
    "senderId": "...",
    "senderType": "customer" | "operations",
    "senderName": "...",
    "message": "Text content",
    "createdAt": "...",
    "read": false,
    "readAt": null
  }
  ```
- [ ] Message read receipts
- [ ] Message delivery status
- [ ] Handle connection/disconnection gracefully
- [ ] Offline message queue

---

## 4. Notifications System 🔔 **[PENDING]**

### In-App Notifications
- [ ] Bell icon in header with unread count badge
- [ ] Dropdown shows recent notifications (last 10)
- [ ] Click notification → Navigate to relevant page
- [ ] Mark individual notification as read
- [ ] Mark all as read button
- [ ] Delete notification option
- [ ] Notification categories/types
- [ ] Real-time notification updates

### Notification Types
- [ ] **Order confirmed** - After payment success
- [ ] **Payment received** - Confirmation to customer
- [ ] **Documents verified** - All docs approved
- [ ] **Documents rejected** - With reason for rejection
- [ ] **Status changed** - Any order status update
- [ ] **New message** - From operations team
- [ ] **Certificate uploaded** - Final deliverable ready
- [ ] **Query raised** - Operations team needs clarification
- [ ] **Assignment notification** - For ops team (assigned case)

### Email Notifications
- [ ] Setup SMTP provider (SendGrid/Mailgun/AWS SES)
- [ ] Email templates (HTML with CSS)
- [ ] Email types:
  - [ ] Order confirmation with payment receipt
  - [ ] Payment success
  - [ ] Documents verification status
  - [ ] Status update emails
  - [ ] Document request emails
  - [ ] Query raised notification
  - [ ] Certificate ready (with download link)
  - [ ] Welcome email
  - [ ] Password reset

### Email Template Features
- [ ] Professional HTML design with LawEthic branding
- [ ] Responsive design (mobile-friendly)
- [ ] Personalization (customer name, order details)
- [ ] Action buttons (View Order, Download Certificate)
- [ ] Unsubscribe link
- [ ] Company contact information
- [ ] Social media links

---

## 5. Document Verification Workflow 📄 **[PENDING]**

### Admin Actions on Documents
- [ ] **Verify** - Mark document as verified ✓
  - Auto-update document status
  - Create timeline entry
  - If all docs verified → Auto-change order status
  
- [ ] **Reject** - Mark document as rejected ✗
  - Require rejection reason (dropdown + custom text)
  - Send notification to customer
  - Create timeline entry
  - Allow customer to re-upload

- [ ] **Request More** - Ask for additional documents
  - Specify which document is needed
  - Send notification to customer
  - Create pending document request
  - Track when customer uploads

### Customer Experience
- [ ] Notification: "Document rejected - PAN card unclear"
- [ ] Go to order detail page
- [ ] See rejection reason clearly displayed
- [ ] Re-upload button for rejected documents
- [ ] Upload additional requested documents
- [ ] See document verification status in real-time

### Document Status Flow
```
Upload → Pending Review → Admin Reviews
  ↓                           ↓
  |                    Rejected ← OR → Verified
  |                      ↓                ↓
  |                  Customer         All Docs
  |                  Re-uploads       Verified?
  |                      ↓                ↓
  └──────────────→ Pending Review    Processing
                                         ↓
                                    Certificate
                                       Ready
```

### Features
- [ ] Bulk document verification
- [ ] Document preview modal
- [ ] Document download
- [ ] Document version history
- [ ] Compare document versions
- [ ] Document annotations (for internal use)

---

## 6. Invoice Generation 🧾 **[PENDING]**

### Auto-Generation After Payment
- [ ] Trigger invoice creation after successful payment
- [ ] Generate unique invoice number (format: `INV-YYYY-NNNN`)
  - Example: `INV-2025-0001`
  - Auto-increment per year
- [ ] Generate PDF using library (pdfkit/puppeteer/react-pdf)
- [ ] Store PDF in Appwrite Storage bucket `invoices`
- [ ] Email invoice to customer automatically
- [ ] Available for download from dashboard

### Invoice Content
- [ ] **Header Section:**
  - Company logo
  - Company name and details
  - GSTIN (if applicable)
  - Invoice number and date
  
- [ ] **Customer Details:**
  - Name, Email, Phone
  - Billing address (if collected)
  
- [ ] **Service Details:**
  - Service name
  - Description
  - HSN/SAC code
  - Quantity (usually 1)
  - Unit price
  
- [ ] **Amount Breakdown:**
  - Subtotal
  - GST (CGST + SGST or IGST)
  - Total amount
  
- [ ] **Payment Information:**
  - Payment method
  - Transaction ID / Razorpay Payment ID
  - Payment date
  - Payment status
  
- [ ] **Footer:**
  - Terms and conditions
  - Bank details (for manual payments)
  - Company signature (digital)
  - Thank you message

### Additional Features
- [ ] Invoice preview before generation
- [ ] Regenerate invoice option (admin)
- [ ] Invoice customization settings (admin)
- [ ] Multiple invoice templates
- [ ] Invoice download in different formats (PDF, PNG)
- [ ] Send invoice via email manually (admin action)

---

## 7. Order Timeline/Activity Log 📅 **[PENDING]**

### Timeline Features
- [ ] Complete activity history for each order
- [ ] Chronological display (newest first or oldest first toggle)
- [ ] Timeline entry types:
  - Order created
  - Payment received
  - Documents uploaded
  - Document verified/rejected
  - Status changed
  - Assigned to team member
  - Message sent/received
  - Certificate uploaded
  - Internal note added
  - Order completed

### Timeline Entry Structure
```json
{
  "orderId": "...",
  "action": "status_changed",
  "description": "Status changed from 'Processing' to 'Certificate Ready'",
  "performedBy": "user_id",
  "performedByName": "Rajesh Kumar",
  "performedByRole": "operations",
  "timestamp": "2025-12-02T10:30:00Z",
  "metadata": {
    "oldValue": "processing",
    "newValue": "certificate_ready"
  },
  "isInternal": false
}
```

### Display Features
- [ ] Timeline component on order detail page
- [ ] Icon for each activity type
- [ ] Color coding by activity type
- [ ] Expandable entries for detailed info
- [ ] Filter timeline by activity type
- [ ] Search timeline entries
- [ ] Export timeline to PDF

### Visibility Rules
- [ ] **Customer sees:**
  - Order created
  - Payment received
  - Documents verified/rejected
  - Status changes
  - Messages sent/received
  - Certificate uploaded
  
- [ ] **Operations/Admin sees:**
  - Everything customers see, PLUS:
  - Internal notes
  - Assignment changes
  - Document verification actions
  - All system actions

### Example Timeline Display
```
📅 Order #ORD-1733135678945

✅ Dec 3, 4:01 PM - Status changed to Completed (System)
📄 Dec 3, 4:00 PM - Certificate uploaded (Rajesh Kumar)
📝 Dec 1, 10:00 AM - Note: "Submitted to GST portal" (Rajesh Kumar) [Internal]
🔄 Nov 30, 2:01 PM - Status changed to Processing (Rajesh Kumar)
✓  Nov 30, 2:00 PM - Documents verified (Rajesh Kumar)
👤 Nov 30, 11:00 AM - Assigned to Rajesh Kumar (Admin)
💰 Nov 30, 10:05 AM - Payment received - ₹3,999 (System)
📦 Nov 30, 10:00 AM - Order created (System)
```

---

## 8. Role-Based Access Control (RBAC) 🔐 **[PENDING]**

### Role Definitions

#### Customer Role
- Default role for all signups
- **Permissions:**
  - ✅ View own orders only
  - ✅ Create new orders
  - ✅ Upload documents for own orders
  - ✅ Download own invoices and certificates
  - ✅ Chat with operations team
  - ✅ View own timeline (public events only)
  - ❌ Cannot access admin routes
  - ❌ Cannot see other customers' orders

#### Operations Role
- Team members handling cases
- **Permissions:**
  - ✅ View assigned cases (or all if admin privilege)
  - ✅ Update order status
  - ✅ Verify/reject documents
  - ✅ Upload certificates
  - ✅ Chat with customers
  - ✅ Add internal notes
  - ✅ View complete timeline
  - ✅ Access `/admin/*` routes
  - ❌ Cannot manage team members
  - ❌ Limited analytics access

#### Admin Role
- Full system access
- **Permissions:**
  - ✅ Everything operations can do, PLUS:
  - ✅ View all cases (regardless of assignment)
  - ✅ Assign/reassign cases
  - ✅ View analytics and reports
  - ✅ Export data
  - ✅ Manage team members (add/remove/update roles)
  - ✅ System configuration
  - ✅ Service management (add/edit/delete services)
  - ✅ Pricing updates

### Implementation Tasks
- [ ] Add `role` attribute to user documents/accounts
- [ ] Create Appwrite Teams for role management
  - `operations` team
  - `admin` team
- [ ] Implement middleware for route protection
  - Check role before rendering admin pages
  - Redirect unauthorized users
- [ ] Create `useAuth` hook with role checking
- [ ] Conditional UI rendering based on role
  - Show/hide admin navigation
  - Show/hide action buttons
  - Filter data based on permissions
- [ ] API route protection (check role in API endpoints)
- [ ] Database permissions aligned with roles
- [ ] Audit log for admin actions

### UI Components Based on Role
- [ ] Customer sees:
  - "My Orders" dashboard
  - Service browsing
  - Order detail (own orders)
  - Chat interface
  
- [ ] Operations sees:
  - Admin dashboard
  - Assigned cases
  - Case detail with full controls
  - Document verification tools
  - Chat interface
  
- [ ] Admin sees:
  - Everything operations sees, PLUS:
  - All cases (not just assigned)
  - Analytics dashboard
  - Team management
  - Service management
  - System settings


---

## 9. Additional Features & Enhancements 🚀 **[FUTURE]**

### High Priority Enhancements
- [ ] Order detail page for customers (`/orders/[id]`)
- [ ] Certificate download functionality
- [ ] Search and filter improvements
- [ ] Mobile responsive improvements
- [ ] Error boundary components
- [ ] Loading skeleton screens
- [ ] Toast notifications for actions

### Medium Priority Features
- [ ] User profile page
  - Edit profile information
  - Change password
  - Email preferences
- [ ] Service reviews and ratings
- [ ] FAQ section
- [ ] Help/Support ticket system
- [ ] Service comparison tool

### Low Priority / Nice-to-Have
- [ ] Referral program
- [ ] Discount coupons/promo codes
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Saved documents/address book
- [ ] Calendar integration for deadlines
- [ ] WhatsApp integration
- [ ] Mobile app (React Native)

---

## 10. Testing & Deployment 🧪 **[ONGOING]**

### Testing Tasks
- [ ] Unit tests for critical functions
- [ ] Integration tests for API routes
- [ ] E2E tests for checkout flow
- [ ] Payment flow testing with test cards
- [ ] Security audit
- [ ] Performance testing
- [ ] Cross-browser testing
- [ ] Mobile responsiveness testing
- [ ] Accessibility testing (WCAG compliance)

### Deployment Tasks
- [ ] Production Appwrite setup
- [ ] Environment variables configuration
- [ ] Database backup strategy
- [ ] Error tracking setup (Sentry)
- [ ] Analytics setup (Google Analytics/Plausible)
- [ ] CDN setup for static assets
- [ ] SSL certificate configuration
- [ ] Domain configuration
- [ ] CI/CD pipeline setup
- [ ] Monitoring and alerting

---

## Progress Summary

### Completed (2/8)
1. ✅ Payment Integration - Full end-to-end payment with Razorpay
2. ✅ Admin Dashboard - Complete case management system with filters, document verification, status updates

### In Progress (0/8)
_None currently_

### Not Started (6/8)
3. ⏳ Real-Time Chat System
4. ⏳ Notifications System
5. ⏳ Document Verification Workflow (Basic done, advanced features pending)
6. ⏳ Invoice Generation
7. ⏳ Order Timeline/Activity Log
8. ⏳ Role-Based Access Control (Core done, advanced features pending)

---

## Next Steps (Priority Order)

### Immediate (This Week)
1. ✅ ~~Complete admin authentication~~ DONE
2. ✅ ~~Create admin dashboard layout~~ DONE
3. ✅ ~~Implement order listing for admin~~ DONE
4. ✅ ~~Admin case detail page~~ DONE
5. ✅ ~~Document verification workflow~~ DONE
6. Create customer order detail page
7. Test admin system with real data
8. Set up admin user accounts

### Short Term (Next 2 Weeks)
1. Certificate upload and delivery
2. Invoice generation system
3. Real-time chat system (customer ↔ operations)
4. Email notifications (status updates, payment confirmation)

### Medium Term (Next Month)
1. Real-time chat system
2. Complete notification system
3. Order timeline implementation
4. Advanced RBAC (team assignments, permissions)
5. Admin analytics dashboard

---

**Last Updated:** December 2, 2025  
**Current Focus:** Admin Dashboard Module - COMPLETED ✅  
**Next Milestone:** Invoice Generation & Certificate Upload

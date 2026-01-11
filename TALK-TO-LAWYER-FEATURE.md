# Talk to Lawyer Feature - Design Document

## Overview

Online legal consultation service connecting customers with verified lawyers for real-time advice on business and personal legal matters.

**Reference**: [VakilSearch Talk to a Lawyer](https://vakilsearch.com/talk-to-a-lawyer)

---

## Table of Contents

1. [Feature Summary](#feature-summary)
2. [Customer Flow](#customer-flow)
3. [Lawyer Flow](#lawyer-flow)
4. [Admin Flow](#admin-flow)
5. [Pricing Model](#pricing-model)
6. [Problem Types / Specializations](#problem-types--specializations)
7. [Database Schema](#database-schema)
8. [Technical Architecture](#technical-architecture)
9. [Implementation Phases](#implementation-phases)
10. [Open Questions](#open-questions)

---

## Feature Summary

| Aspect | Details |
|--------|---------|
| **Service** | On-demand legal consultation via phone/video call |
| **Duration** | 30 minutes (extendable) |
| **Pricing** | Starting ₹499 per consultation |
| **Consultation Types** | Instant (within 15 mins) / Scheduled |
| **Languages** | English, Hindi, Regional languages |
| **Platform Commission** | 30% of consultation fee |

---

## Customer Flow

### Journey Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CUSTOMER JOURNEY                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [Landing] → [Select Type] → [Payment] → [Consultation] → [Review]  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Step 1: Discovery & Lead Capture

**URL**: `/consult-lawyer`

**Page Elements**:
- Hero section with value proposition
- Lead capture form:
  - Email (required)
  - Mobile Number (required)
  - City/Pincode (optional)
  - Language preference (dropdown)
  - Problem Type (dropdown)
- Social proof indicators:
  - "X lawyers are available"
  - "Y live ongoing calls"
  - Customer testimonials
- CTA: "Get Consultation"

**Form Fields**:
| Field | Type | Required | Options |
|-------|------|----------|---------|
| Email | Email input | Yes | - |
| Mobile | Phone input | Yes | - |
| City | Text/Autocomplete | No | - |
| Language | Dropdown | Yes | English, Hindi, Bengali, Tamil, etc. |
| Problem Type | Dropdown | Yes | See [Problem Types](#problem-types--specializations) |

---

### Step 2: Consultation Type Selection

**URL**: `/consult-lawyer/book`

**Options**:

#### Option A: Instant Consultation
- For urgent matters
- Connect with available lawyer within 15 minutes
- Shows: "X Active lawyers found"
- Lawyer auto-assigned based on:
  - Specialization match
  - Language match
  - Current availability
  - Rating (higher rated preferred)

#### Option B: Scheduled Consultation
- Choose preferred date (next 7 days)
- Choose time slot (30-minute slots)
- Shows available slots based on lawyer availability
- Can select preferred lawyer (optional)

**UI Elements**:
```
┌─────────────────────────────────────────────────┐
│  Choose How You'd Like to Start                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  ○ Consult Now                                  │
│    For instant assistance with immediate call   │
│    ┌─────────────────────────────────────┐     │
│    │ 👥 6 Active lawyers found            │     │
│    │ Match Found!                         │     │
│    │ Consult within 15 mins               │     │
│    └─────────────────────────────────────┘     │
│                                                 │
│  ○ Schedule Call                                │
│    Choose a convenient time for consultation    │
│    ┌─────────────────────────────────────┐     │
│    │ 📅 Select Date: [Calendar]          │     │
│    │ 🕐 Select Time: [Slots]             │     │
│    └─────────────────────────────────────┘     │
│                                                 │
│  [Next →]                                       │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### Step 3: Booking Confirmation & Payment

**URL**: `/consult-lawyer/confirm`

**Page Elements**:
- Matched lawyer preview (photo, name, specialization, rating)
- Booking summary:
  - Date & Time (for scheduled)
  - Duration: 30 minutes
  - Problem type
  - Language
- Mobile number verification (OTP)
- Additional questions:
  - "Is this consultation related to your business matters?" (Yes/No)
  - "Would you like to hire a lawyer to handle your case?" (Yes/No) - for upsell
- Price breakdown:
  - Consultation fee: ₹499
  - GST (18%): ₹90
  - Total: ₹589
- Payment button → Razorpay

**Post-Payment**:
- Booking confirmed screen
- Email confirmation with:
  - Booking ID
  - Date/Time
  - Lawyer details
  - Meeting link (if video call)
  - Instructions
- SMS confirmation
- WhatsApp notification (optional)

---

### Step 4: Consultation

**Before Call**:
- Customer receives reminder (15 mins before)
- Join link available in dashboard & email
- Option to reschedule (up to 2 hours before)

**During Call**:
- Phone call: Lawyer calls customer's registered number
- Video call: Both join via meeting link (Google Meet/Jitsi)
- Duration timer visible
- Option to extend (₹199 per 15 mins)

**Call Extension Flow**:
```
┌─────────────────────────────────────────┐
│  Your 30-minute session is ending       │
│                                         │
│  Would you like to extend?              │
│                                         │
│  [+15 mins - ₹199] [+30 mins - ₹349]   │
│                                         │
│  [End Consultation]                     │
└─────────────────────────────────────────┘
```

---

### Step 5: Post-Consultation

**URL**: `/dashboard/consultations/[id]`

**Available to Customer**:
- Consultation summary (uploaded by lawyer)
- Recommended next steps
- Download invoice/receipt
- Rate the lawyer (1-5 stars)
- Write review (optional)
- Option: "Book Follow-up Consultation"
- Option: "Hire this Lawyer for Your Case" (leads to case management)

**Rating & Review UI**:
```
┌─────────────────────────────────────────┐
│  How was your consultation?             │
│                                         │
│  ⭐⭐⭐⭐⭐                              │
│                                         │
│  Write a review (optional):             │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Submit Review]                        │
└─────────────────────────────────────────┘
```

---

## Lawyer Flow

### Journey Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          LAWYER JOURNEY                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [Register] → [Verify] → [Set Availability] → [Accept] → [Consult]  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Step 1: Lawyer Onboarding

**URL**: `/lawyer/register`

**Registration Form**:
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Full Name | Text | Yes | As per Bar Council |
| Email | Email | Yes | For communication |
| Mobile | Phone | Yes | For calls |
| Bar Council State | Dropdown | Yes | State of registration |
| Bar Council Number | Text | Yes | Enrollment number |
| Year of Enrollment | Number | Yes | For experience calculation |
| Specializations | Multi-select | Yes | Max 5 |
| Languages | Multi-select | Yes | At least 1 |
| Bio/About | Textarea | Yes | 100-500 characters |
| Profile Photo | File upload | Yes | Professional photo |
| Bar Council Certificate | File upload | Yes | PDF/Image |
| ID Proof | File upload | Yes | Aadhaar/PAN |
| Bank Account Name | Text | Yes | For payouts |
| Bank Account Number | Text | Yes | For payouts |
| IFSC Code | Text | Yes | For payouts |
| UPI ID | Text | No | Optional |

**Terms Acceptance**:
- Platform terms of service
- Commission structure acknowledgment
- Code of conduct

---

### Step 2: Verification (Admin Review)

**Status Flow**:
```
[Submitted] → [Under Review] → [Approved] / [Rejected] / [More Info Needed]
```

**Admin Verification Checklist**:
- [ ] Bar Council number is valid
- [ ] Certificate matches submitted details
- [ ] Photo is professional and clear
- [ ] ID proof matches name
- [ ] No disciplinary actions on record

**Communication**:
- Email sent on status change
- If rejected: Reason provided with option to resubmit
- If approved: Welcome email with dashboard access

---

### Step 3: Availability Management

**URL**: `/lawyer/dashboard/availability`

**Weekly Schedule Setup**:
```
┌─────────────────────────────────────────────────────────────────┐
│  Set Your Weekly Availability                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Monday      [✓] Available   09:00 AM - 06:00 PM                │
│  Tuesday     [✓] Available   09:00 AM - 06:00 PM                │
│  Wednesday   [✓] Available   09:00 AM - 01:00 PM                │
│  Thursday    [✓] Available   09:00 AM - 06:00 PM                │
│  Friday      [✓] Available   09:00 AM - 06:00 PM                │
│  Saturday    [ ] Unavailable                                     │
│  Sunday      [ ] Unavailable                                     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ☑ Available for Instant Consultations                   │    │
│  │   (You'll receive immediate booking requests)           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  [Save Schedule]                                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Holiday/Leave Management**:
- Mark specific dates as unavailable
- Bulk unavailability (date range)
- Auto-block when daily limit reached

---

### Step 4: Receiving & Accepting Bookings

**URL**: `/lawyer/dashboard`

**Notification Channels**:
- In-app notification (bell icon)
- Email notification
- SMS notification
- WhatsApp notification (optional)

**Instant Consultation Request**:
```
┌─────────────────────────────────────────────────────────────────┐
│  🔔 New Instant Consultation Request                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Problem Type: Cheque Bounce / Money Recovery                   │
│  Language: English                                               │
│  Customer: John D. (Delhi)                                       │
│                                                                  │
│  ⏱️ Accept within 5 minutes or auto-reassigned                  │
│                                                                  │
│  [Accept] [Decline]                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Scheduled Consultation**:
- Auto-confirmed if slot is available
- Appears in lawyer's calendar
- Reminder sent 1 hour and 15 mins before

---

### Step 5: Conducting Consultation

**Pre-Call Checklist** (shown to lawyer):
- Review customer's problem description
- Prepare relevant information
- Ensure quiet environment
- Test audio/video

**During Consultation**:
- Dashboard shows:
  - Customer details
  - Problem description
  - Timer (countdown)
  - Notes area (for lawyer's reference)
- Options:
  - Extend consultation (customer pays)
  - End consultation early
  - Report issue

**Post-Consultation Actions**:
```
┌─────────────────────────────────────────────────────────────────┐
│  Complete Consultation - [Consultation ID]                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Consultation Summary *                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Brief summary of discussion and advice given...         │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Recommended Next Steps                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 1. File consumer complaint within 30 days               │    │
│  │ 2. Gather all transaction records                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  [ ] Customer may need full legal representation                 │
│      (Send "Hire Me" proposal)                                   │
│                                                                  │
│  [Submit & Complete]                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Step 6: Earnings & Payouts

**URL**: `/lawyer/dashboard/earnings`

**Dashboard View**:
```
┌─────────────────────────────────────────────────────────────────┐
│  Earnings Overview                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  This Month                                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │
│  │ ₹12,500     │ │ 25          │ │ 4.8 ⭐      │                │
│  │ Earnings    │ │ Consultations│ │ Avg Rating  │                │
│  └─────────────┘ └─────────────┘ └─────────────┘                │
│                                                                  │
│  Available for Payout: ₹10,500                                   │
│  [Request Payout]                                                │
│                                                                  │
│  Recent Transactions                                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Jan 8  │ Consultation #123 │ +₹349  │ Completed         │    │
│  │ Jan 7  │ Consultation #122 │ +₹349  │ Completed         │    │
│  │ Jan 6  │ Payout #45        │ -₹5000 │ Processed         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Payout Rules**:
- Minimum payout amount: ₹1,000
- Payout frequency: Weekly (every Monday)
- Processing time: 2-3 business days
- 24-hour hold on earnings (for dispute resolution)

---

## Admin Flow

### Admin Dashboard Sections

**URL**: `/admin/lawyers`

#### Lawyer Management
| Action | Description |
|--------|-------------|
| View pending verifications | Review new lawyer applications |
| Approve/Reject lawyer | With reason for rejection |
| View all lawyers | Filter by status, specialization, rating |
| Suspend lawyer | Temporarily disable account |
| Edit lawyer details | Update specialization, etc. |
| View lawyer earnings | Consultation history & payouts |

#### Consultation Management

**URL**: `/admin/consultations`

| View | Description |
|------|-------------|
| Scheduled | Upcoming consultations |
| Ongoing | Currently in progress |
| Completed | Finished consultations |
| Cancelled | Cancelled by customer/lawyer |
| No-show | Customer/Lawyer didn't join |
| Disputed | Flagged for review |

**Actions**:
- View consultation details
- Issue refund (full/partial)
- Reassign lawyer
- Extend time (complimentary)
- Add internal notes

#### Payout Management

**URL**: `/admin/payouts`

| Status | Action |
|--------|--------|
| Pending | Review and process |
| Processing | Mark as transferred |
| Completed | View transaction details |
| Failed | Retry or contact lawyer |

#### Analytics Dashboard

**URL**: `/admin/analytics/consultations`

**Metrics**:
- Total consultations (daily/weekly/monthly)
- Revenue generated
- Platform commission earned
- Average rating
- Problem type distribution
- Peak hours
- Lawyer utilization rate
- Customer satisfaction score

---

## Pricing Model

### Consultation Fees

| Duration | Customer Pays | Lawyer Gets (70%) | Platform Gets (30%) |
|----------|--------------|-------------------|---------------------|
| 30 minutes | ₹499 | ₹349 | ₹150 |
| 60 minutes | ₹899 | ₹629 | ₹270 |
| Extension (15 min) | ₹199 | ₹139 | ₹60 |

*Note: GST (18%) additional on customer's total*

### Pricing Comparison with Competitors

| Platform | 30-min Price | Notes |
|----------|--------------|-------|
| VakilSearch | ₹499 | + GST |
| LegalKart | ₹399-999 | Based on lawyer |
| Lawrato | ₹500-1500 | Varies |
| **LawEthic (Proposed)** | ₹499 | + GST |

---

## Problem Types / Specializations

### Primary Categories

| Category | Sub-types |
|----------|-----------|
| **Money & Finance** | Cheque Bounce, Money Recovery, Loan Issues, Banking Disputes |
| **Property** | Property Disputes, Landlord-Tenant, Real Estate Fraud, Title Issues |
| **Criminal** | FIR/Police Complaint, Bail, Criminal Defense, Cyber Crime |
| **Family** | Divorce, Child Custody, Domestic Violence, Maintenance/Alimony |
| **Consumer** | Product Defects, Service Complaints, E-commerce Issues |
| **Business** | Contract Disputes, Partnership Issues, Startup Legal, MSME Issues |
| **Employment** | Wrongful Termination, Salary Disputes, Harassment, Labour Law |
| **Tax** | Income Tax Notice, GST Issues, Tax Planning |
| **Intellectual Property** | Trademark Issues, Copyright, Patent |
| **Immigration** | Visa Issues, OCI/PIO, Foreign Investment |
| **Other** | General Legal Query |

---

## Database Schema

### Appwrite Collections

#### 1. `lawyers`

```javascript
{
  $id: string,                    // Auto-generated
  userId: string,                 // Links to Appwrite Auth user
  
  // Personal Info
  name: string,
  email: string,
  phone: string,
  photoUrl: string,
  bio: string,
  
  // Professional Info
  barCouncilState: string,
  barCouncilNumber: string,
  yearOfEnrollment: number,
  specializations: string[],      // Array of problem types
  languages: string[],            // Array: ['english', 'hindi', 'tamil']
  
  // Documents
  barCertificateUrl: string,
  idProofUrl: string,
  
  // Status
  status: string,                 // 'pending' | 'approved' | 'suspended' | 'rejected'
  rejectionReason: string,        // If rejected
  verifiedAt: datetime,
  verifiedBy: string,             // Admin userId
  
  // Performance
  rating: number,                 // Average rating (1-5)
  totalRatings: number,
  totalConsultations: number,
  completionRate: number,         // Percentage
  
  // Availability
  availableForInstant: boolean,
  hourlyRate: number,             // Optional override (null = platform default)
  
  // Payout Info
  bankAccountName: string,
  bankAccountNumber: string,      // Encrypted
  bankIfsc: string,
  upiId: string,
  
  // Timestamps
  createdAt: datetime,
  updatedAt: datetime
}
```

#### 2. `lawyer_availability`

```javascript
{
  $id: string,
  lawyerId: string,               // Reference to lawyers collection
  
  dayOfWeek: number,              // 0 (Sunday) - 6 (Saturday)
  startTime: string,              // "09:00"
  endTime: string,                // "18:00"
  
  isActive: boolean,
  
  createdAt: datetime,
  updatedAt: datetime
}
```

#### 3. `lawyer_holidays`

```javascript
{
  $id: string,
  lawyerId: string,
  
  date: datetime,                 // Specific date
  reason: string,                 // Optional
  
  createdAt: datetime
}
```

#### 4. `consultations`

```javascript
{
  $id: string,
  
  // Parties
  customerId: string,             // Appwrite userId
  customerName: string,
  customerPhone: string,
  customerEmail: string,
  
  lawyerId: string,               // Reference to lawyers
  lawyerName: string,
  
  // Consultation Details
  problemType: string,
  problemDescription: string,
  language: string,
  
  // Type & Timing
  type: string,                   // 'instant' | 'scheduled'
  scheduledAt: datetime,          // For scheduled consultations
  duration: number,               // In minutes (30, 45, 60)
  
  // Meeting
  meetingLink: string,            // Google Meet / Jitsi link
  meetingType: string,            // 'phone' | 'video'
  
  // Status
  status: string,                 // 'pending' | 'confirmed' | 'ongoing' | 
                                  // 'completed' | 'cancelled' | 'no_show' | 'disputed'
  cancelledBy: string,            // 'customer' | 'lawyer' | 'admin'
  cancellationReason: string,
  
  // Financials
  amount: number,                 // Total charged to customer (excl. GST)
  gstAmount: number,
  totalAmount: number,            // amount + gstAmount
  platformFee: number,            // 30% of amount
  lawyerPayout: number,           // 70% of amount
  
  // Payment
  paymentId: string,              // Razorpay payment ID
  paymentStatus: string,          // 'pending' | 'paid' | 'refunded' | 'partial_refund'
  refundAmount: number,
  refundReason: string,
  
  // Post-Consultation
  summary: string,                // Uploaded by lawyer
  recommendations: string,        // Next steps
  
  // Rating
  rating: number,                 // 1-5 stars
  review: string,                 // Customer review
  ratedAt: datetime,
  
  // Timestamps
  createdAt: datetime,
  confirmedAt: datetime,
  startedAt: datetime,
  completedAt: datetime,
  
  // Metadata
  source: string,                 // 'web' | 'mobile' | 'admin'
  utmSource: string,
  utmMedium: string,
  utmCampaign: string
}
```

#### 5. `lawyer_payouts`

```javascript
{
  $id: string,
  
  lawyerId: string,
  
  amount: number,
  consultationIds: string[],      // Array of consultation IDs
  consultationCount: number,
  
  // Bank Details (snapshot at time of payout)
  bankAccountName: string,
  bankAccountNumber: string,
  bankIfsc: string,
  
  status: string,                 // 'pending' | 'processing' | 'completed' | 'failed'
  failureReason: string,
  
  // Transaction
  transactionId: string,          // Bank reference
  processedAt: datetime,
  processedBy: string,            // Admin userId
  
  createdAt: datetime
}
```

#### 6. `consultation_extensions`

```javascript
{
  $id: string,
  
  consultationId: string,
  
  duration: number,               // Additional minutes (15, 30)
  amount: number,
  paymentId: string,
  
  createdAt: datetime
}
```

---

## Technical Architecture

### Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14 (App Router) |
| Database | Appwrite Cloud |
| Auth | Appwrite Auth |
| Storage | Appwrite Storage |
| Payments | Razorpay |
| Video Calls | Google Meet API / Jitsi Meet |
| Notifications | Appwrite Functions + Resend |
| SMS | MSG91 / Twilio |

### API Routes (Next.js)

```
/api/consultations/
├── create                    # Create new consultation booking
├── [id]/
│   ├── confirm              # Confirm and process payment
│   ├── cancel               # Cancel consultation
│   ├── extend               # Extend duration
│   ├── complete             # Mark as completed
│   ├── rate                 # Submit rating & review
│   └── refund               # Process refund

/api/lawyers/
├── register                  # Lawyer registration
├── [id]/
│   ├── availability         # Get/Set availability
│   ├── holidays             # Manage holidays
│   ├── toggle-instant       # Toggle instant availability
│   └── earnings             # Get earnings summary

/api/admin/
├── lawyers/
│   ├── pending              # Get pending verifications
│   ├── [id]/approve         # Approve lawyer
│   ├── [id]/reject          # Reject lawyer
│   └── [id]/suspend         # Suspend lawyer
├── consultations/
│   ├── list                 # List all consultations
│   └── [id]/refund          # Process refund
└── payouts/
    ├── pending              # Get pending payouts
    └── [id]/process         # Process payout
```

### Page Routes

```
Customer:
├── /consult-lawyer                    # Landing page
├── /consult-lawyer/book               # Booking flow
├── /consult-lawyer/confirm            # Payment
├── /consult-lawyer/success            # Booking confirmed
├── /dashboard/consultations           # My consultations
└── /dashboard/consultations/[id]      # Consultation detail

Lawyer:
├── /lawyer/register                   # Registration
├── /lawyer/dashboard                  # Main dashboard
├── /lawyer/dashboard/availability     # Set availability
├── /lawyer/dashboard/consultations    # All consultations
├── /lawyer/dashboard/consultations/[id] # Single consultation
├── /lawyer/dashboard/earnings         # Earnings & payouts
└── /lawyer/dashboard/profile          # Edit profile

Admin:
├── /admin/lawyers                     # Lawyer management
├── /admin/lawyers/[id]                # Lawyer detail
├── /admin/consultations               # All consultations
├── /admin/consultations/[id]          # Consultation detail
├── /admin/payouts                     # Payout management
└── /admin/analytics/consultations     # Analytics
```

---

## Implementation Phases

### Phase 1: MVP (2-3 weeks)

**Goal**: Launch basic consultation booking with manual lawyer assignment

**Features**:
- [ ] Customer landing page (`/consult-lawyer`)
- [ ] Lead capture form
- [ ] Scheduled consultations only (no instant)
- [ ] Manual lawyer assignment by admin
- [ ] Basic lawyer onboarding form
- [ ] Admin lawyer verification
- [ ] Payment integration (Razorpay)
- [ ] Email notifications (booking confirmation)
- [ ] Simple customer dashboard (view bookings)
- [ ] Simple admin panel (manage lawyers, view bookings)

**Database**:
- [ ] `lawyers` collection (basic fields)
- [ ] `consultations` collection

**Not Included**:
- Instant consultations
- Lawyer availability management
- Video call integration
- Rating & reviews
- Lawyer dashboard
- Automated payouts

---

### Phase 2: Full Feature (2-3 weeks)

**Goal**: Complete platform with automated matching and lawyer dashboard

**Features**:
- [ ] Lawyer dashboard (`/lawyer/dashboard`)
- [ ] Availability management
- [ ] Instant consultation with auto-matching
- [ ] Video call integration (Google Meet / Jitsi)
- [ ] Rating & review system
- [ ] Consultation summary upload
- [ ] SMS notifications
- [ ] WhatsApp notifications
- [ ] Lawyer earnings dashboard
- [ ] Customer consultation history
- [ ] Search/filter lawyers

**Database**:
- [ ] `lawyer_availability` collection
- [ ] `lawyer_holidays` collection
- [ ] `consultation_extensions` collection

---

### Phase 3: Scale (2-3 weeks)

**Goal**: Automate operations and add growth features

**Features**:
- [ ] Automated weekly payouts
- [ ] Advanced analytics dashboard
- [ ] Lawyer performance reports
- [ ] Referral system (refer a friend)
- [ ] Subscription plans for frequent users
- [ ] Follow-up booking discounts
- [ ] "Hire this lawyer" case management
- [ ] Consultation recordings (optional)
- [ ] Multi-language UI
- [ ] Mobile-responsive optimization

**Database**:
- [ ] `lawyer_payouts` collection
- [ ] `referrals` collection
- [ ] `subscriptions` collection

---

## Open Questions

### Questions to Decide Before Implementation

| # | Question | Options | Decision |
|---|----------|---------|----------|
| 1 | **Call Method** | Phone only / Video only / Both | _TBD_ |
| 2 | **Video Platform** | Google Meet / Zoom / Jitsi (free) | _TBD_ |
| 3 | **Instant in MVP?** | Yes / No (Phase 2) | _TBD_ |
| 4 | **Lawyer Sourcing** | Self-register / Invite only / Both | _TBD_ |
| 5 | **Commission Rate** | 30% / 25% / 20% | _TBD_ |
| 6 | **Base Price** | ₹499 / ₹399 / ₹599 | _TBD_ |
| 7 | **Payout Frequency** | Weekly / Bi-weekly / On-demand | _TBD_ |
| 8 | **Minimum Payout** | ₹500 / ₹1000 / ₹2000 | _TBD_ |
| 9 | **Refund Policy** | Full if cancelled 2hrs before / Partial / No refund | _TBD_ |
| 10 | **Lawyer Verification** | Manual only / Automated Bar check + Manual | _TBD_ |

---

## Appendix

### Notification Templates

#### Email: Booking Confirmed (Customer)
```
Subject: Consultation Booked - [Date] at [Time]

Hi [Customer Name],

Your legal consultation has been booked successfully!

📅 Date: [Date]
🕐 Time: [Time]
👨‍⚖️ Lawyer: [Lawyer Name]
📋 Topic: [Problem Type]

[Join Meeting Button]

Please ensure:
- You're in a quiet place
- You have all relevant documents ready
- You join 5 minutes before the scheduled time

Booking ID: [ID]

Need to reschedule? [Reschedule Link]
```

#### SMS: Booking Reminder
```
LawEthic: Your consultation with Adv. [Name] starts in 15 mins. 
Join now: [Link]
```

### Error Handling

| Scenario | Customer Message | Action |
|----------|------------------|--------|
| No lawyer available (instant) | "All lawyers are currently busy. Please try scheduling a call." | Redirect to scheduled booking |
| Payment failed | "Payment failed. Please try again." | Retry payment |
| Lawyer no-show | "We apologize, your lawyer couldn't join. Full refund initiated." | Auto-refund + reschedule option |
| Customer no-show | "You missed your consultation. 50% refund initiated." | Partial refund |

---

## Document Version

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 8, 2026 | LawEthic Team | Initial draft |

---

*This document is for internal discussion purposes. Please share feedback before implementation begins.*

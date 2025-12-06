# Email Notification System

This module handles all email notifications for the LawEthic application using [Resend](https://resend.com).

## Setup

### 1. Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (or use their test domain for development)
3. Get your API key from the dashboard

### 2. Configure Environment Variables

Add to your `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=LawEthic <noreply@yourdomain.com>
```

**Development Mode:**
- Use Resend's test domain: `onboarding@resend.dev`
- Emails will only be sent to verified email addresses

**Production Mode:**
- Verify your domain in Resend dashboard
- Update `EMAIL_FROM` with your domain

### 3. Domain Verification (Production)

1. Go to Resend Dashboard > Domains
2. Add your domain (e.g., `lawethic.com`)
3. Add the DNS records provided by Resend
4. Wait for verification (usually 24-48 hours)

## Available Email Functions

### 1. Invoice Email
Sent automatically after invoice generation with PDF attachment.

```typescript
import { sendInvoiceEmail } from '@/lib/email/email-service';

await sendInvoiceEmail(
  'customer@example.com',
  'John Doe',
  'INV-2025-0001',
  'ORD-12345',
  'Business Registration',
  5000,
  pdfBuffer
);
```

### 2. Payment Confirmation Email
Sent when payment succeeds but invoice generation fails.

```typescript
import { sendPaymentConfirmationEmail } from '@/lib/email/email-service';

await sendPaymentConfirmationEmail(
  'customer@example.com',
  'John Doe',
  'ORD-12345',
  'Business Registration',
  5000,
  'pay_xyz123'
);
```

### 3. Order Status Update Email
Notify customer when order status changes.

```typescript
import { sendOrderStatusEmail } from '@/lib/email/email-service';

await sendOrderStatusEmail(
  'customer@example.com',
  'John Doe',
  'ORD-12345',
  'Business Registration',
  'completed',
  'Your documents are ready for download'
);
```

### 4. Document Upload Notification
Alert customer when new documents are uploaded.

```typescript
import { sendDocumentUploadedEmail } from '@/lib/email/email-service';

await sendDocumentUploadedEmail(
  'customer@example.com',
  'John Doe',
  'ORD-12345',
  'Certificate of Incorporation.pdf'
);
```

## Email Templates

All emails use responsive HTML templates with:
- Professional design matching LawEthic branding
- Mobile-friendly layout
- Call-to-action buttons
- Fallback text version

### Customization

Edit templates in `email-service.ts`:
- Colors: Modify inline styles in HTML
- Branding: Update header and footer
- Content: Adjust text and structure

## Integration Points

### Automatic Triggers

1. **Invoice Generation** (`lib/invoice/invoice-generator.ts`)
   - Sends invoice email with PDF attachment
   - Triggered after successful invoice creation

2. **Payment Verification** (`app/api/payment/verify/route.ts`)
   - Sends confirmation email if invoice fails
   - Triggered after payment success

### Manual Triggers (To Implement)

3. **Status Updates** (Admin Panel)
   - Call `sendOrderStatusEmail()` when admin changes status

4. **Document Uploads** (Admin Panel)
   - Call `sendDocumentUploadedEmail()` after admin uploads documents

## Testing

### Test in Development

With Resend test mode, emails are only sent to verified addresses.

1. Verify your test email in Resend dashboard
2. Make a test payment
3. Check your inbox for invoice email

### Test Email Sending

Create a test script:

```typescript
// scripts/test-email.ts
import { sendPaymentConfirmationEmail } from '../apps/web/lib/email/email-service';

async function test() {
  const result = await sendPaymentConfirmationEmail(
    'your-verified-email@example.com',
    'Test User',
    'TEST-001',
    'Test Service',
    1000,
    'test_payment_id'
  );
  
  console.log('Result:', result);
}

test();
```

Run: `npx tsx scripts/test-email.ts`

## Error Handling

All email functions:
- Return `{ success: true, id: 'email_id' }` on success
- Return `{ success: false, error: 'message' }` on failure
- Log errors to console
- **Never throw errors** to avoid breaking payment flow

## Production Checklist

- [ ] Resend API key configured
- [ ] Domain verified in Resend
- [ ] EMAIL_FROM updated with verified domain
- [ ] Test all email types
- [ ] Verify spam score (use mail-tester.com)
- [ ] Check email rendering across clients
- [ ] Monitor Resend dashboard for delivery rates
- [ ] Set up webhooks for bounce handling (optional)

## Rate Limits

Resend free tier:
- 3,000 emails/month
- 100 emails/day

Upgrade as needed for production volume.

## Troubleshooting

### Emails not sending

1. Check `RESEND_API_KEY` is set correctly
2. Verify recipient email in Resend dashboard (dev mode)
3. Check console logs for errors
4. Verify domain is confirmed (production)

### Emails going to spam

1. Verify domain in Resend
2. Add SPF, DKIM, DMARC records
3. Avoid spam trigger words
4. Test with mail-tester.com

### PDF attachments not working

1. Ensure PDF buffer is valid
2. Check file size (< 10MB)
3. Verify MIME type is `application/pdf`

## Future Enhancements

- [ ] Email templates in separate files
- [ ] React Email for template management
- [ ] Email preview endpoint
- [ ] Unsubscribe functionality
- [ ] Email analytics tracking
- [ ] Bulk email sending
- [ ] Email queue for reliability

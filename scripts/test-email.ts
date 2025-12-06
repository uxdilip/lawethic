#!/usr/bin/env tsx

/**
 * Test Email Notifications
 * 
 * This script tests the email notification system.
 * Before running, make sure to:
 * 1. Set RESEND_API_KEY in .env.local
 * 2. Verify your test email in Resend dashboard (for dev mode)
 * 
 * Usage: npx tsx scripts/test-email.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from apps/web/.env.local
config({ path: resolve(__dirname, '../apps/web/.env.local') });

import {
    sendPaymentConfirmationEmail,
    sendOrderStatusEmail,
    sendDocumentUploadedEmail
} from '../apps/web/lib/email/email-service';

const TEST_EMAIL = process.env.TEST_EMAIL || 'your-email@example.com';
const TEST_NAME = 'Test User';

async function testPaymentConfirmation() {
    console.log('\n1. Testing Payment Confirmation Email...');
    console.log(`   Sending to: ${TEST_EMAIL}`);

    const result = await sendPaymentConfirmationEmail(
        TEST_EMAIL,
        TEST_NAME,
        'ORD-TEST-001',
        'Business Registration Service',
        5000,
        'pay_test123456789'
    );

    if (result.success) {
        console.log('   ✅ Payment confirmation email sent successfully!');
        console.log(`   Email ID: ${result.id}`);
    } else {
        console.log('   ❌ Failed to send payment confirmation email');
        console.log(`   Error: ${result.error}`);
    }

    return result.success;
}

async function testStatusUpdate() {
    console.log('\n2. Testing Order Status Update Email...');
    console.log(`   Sending to: ${TEST_EMAIL}`);

    const result = await sendOrderStatusEmail(
        TEST_EMAIL,
        TEST_NAME,
        'ORD-TEST-002',
        'GST Registration Service',
        'completed',
        'Your GST registration has been completed successfully. All documents are ready for download.'
    );

    if (result.success) {
        console.log('   ✅ Status update email sent successfully!');
        console.log(`   Email ID: ${result.id}`);
    } else {
        console.log('   ❌ Failed to send status update email');
        console.log(`   Error: ${result.error}`);
    }

    return result.success;
}

async function testDocumentUpload() {
    console.log('\n3. Testing Document Upload Notification...');
    console.log(`   Sending to: ${TEST_EMAIL}`);

    const result = await sendDocumentUploadedEmail(
        TEST_EMAIL,
        TEST_NAME,
        'ORD-TEST-003',
        'Certificate of Incorporation.pdf'
    );

    if (result.success) {
        console.log('   ✅ Document upload email sent successfully!');
        console.log(`   Email ID: ${result.id}`);
    } else {
        console.log('   ❌ Failed to send document upload email');
        console.log(`   Error: ${result.error}`);
    }

    return result.success;
}

async function main() {
    console.log('='.repeat(60));
    console.log('Testing Email Notification System');
    console.log('='.repeat(60));

    if (!process.env.RESEND_API_KEY) {
        console.error('\n❌ RESEND_API_KEY not found in environment variables');
        console.error('Please add it to .env.local');
        process.exit(1);
    }

    if (TEST_EMAIL === 'your-email@example.com') {
        console.error('\n⚠️  Warning: Using default test email');
        console.error('Set TEST_EMAIL environment variable for actual testing');
        console.error('Example: TEST_EMAIL=your@email.com npx tsx scripts/test-email.ts\n');
    }

    console.log(`\nConfiguration:`);
    console.log(`  API Key: ${process.env.RESEND_API_KEY.substring(0, 10)}...`);
    console.log(`  Test Email: ${TEST_EMAIL}`);
    console.log(`  From: ${process.env.EMAIL_FROM || 'LawEthic <noreply@lawethic.com>'}`);
    console.log(`\n⏳ Sending emails with 1-second delay to respect rate limits...\n`);

    const results = {
        payment: await testPaymentConfirmation(),
        status: false,
        document: false,
    };

    // Wait 1 second between emails to respect Resend's rate limit (2 req/sec)
    await new Promise(resolve => setTimeout(resolve, 1000));
    results.status = await testStatusUpdate();

    await new Promise(resolve => setTimeout(resolve, 1000));
    results.document = await testDocumentUpload();

    console.log('\n' + '='.repeat(60));
    console.log('Test Results Summary');
    console.log('='.repeat(60));
    console.log(`Payment Confirmation: ${results.payment ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Status Update: ${results.status ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Document Upload: ${results.document ? '✅ PASS' : '❌ FAIL'}`);

    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(Boolean).length;

    console.log('\n' + '='.repeat(60));
    console.log(`Total: ${passedTests}/${totalTests} tests passed`);
    console.log('='.repeat(60));

    if (passedTests === totalTests) {
        console.log('\n✅ All tests passed! Email system is working correctly.');
        console.log('Check your inbox at:', TEST_EMAIL);
    } else {
        console.log('\n⚠️  Some tests failed. Check the errors above.');
        process.exit(1);
    }
}

main().catch(console.error);

import { NextRequest, NextResponse } from 'next/server';
import { generateInvoice } from '@/lib/invoice/invoice-generator';

export async function POST(request: NextRequest) {
    try {
        const { orderId } = await request.json();

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            );
        }

        // TODO: Add admin authentication check here
        // For now, anyone can regenerate invoices

        console.log(`[API] Regenerating invoice for order ${orderId}...`);

        const invoice = await generateInvoice(orderId);

        return NextResponse.json({
            success: true,
            message: 'Invoice generated successfully',
            invoiceNumber: invoice.invoiceNumber,
            fileId: invoice.fileId,
        });

    } catch (error: any) {
        console.error('[API] Invoice generation failed:', error);
        return NextResponse.json(
            { error: 'Failed to generate invoice', details: error.message },
            { status: 500 }
        );
    }
}

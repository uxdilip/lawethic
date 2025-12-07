export interface InvoiceData {
    invoiceNumber: string;
    invoiceDate: string;
    orderNumber: string;

    // Customer details
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    businessName?: string;

    // Service details
    serviceName: string;
    serviceDescription: string;
    features?: string[];

    // Payment details
    amount: number;
    currency: string;
    paymentMethod: string;
    transactionId: string;
    paymentDate: string;

    // Order details
    orderId: string;
}

export interface InvoiceCounter {
    $id: string;
    year: number;
    lastNumber: number;
    prefix: string;
}

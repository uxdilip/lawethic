import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { InvoiceData } from './invoice-types';

// Register fonts (optional - using default for now)
// Font.register({
//   family: 'Roboto',
//   src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2',
// });

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: 'Helvetica',
        backgroundColor: '#FFFFFF',
    },
    header: {
        marginBottom: 30,
    },
    logo: {
        fontSize: 24,
        fontFamily: 'Helvetica-Bold',
        color: '#2563EB',
        marginBottom: 8,
    },
    companyInfo: {
        fontSize: 9,
        color: '#6B7280',
        lineHeight: 1.5,
    },
    invoiceTitle: {
        fontSize: 32,
        fontFamily: 'Helvetica-Bold',
        color: '#111827',
        textAlign: 'right',
        marginBottom: 10,
    },
    invoiceDetails: {
        textAlign: 'right',
        fontSize: 10,
        color: '#6B7280',
        marginBottom: 5,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        color: '#111827',
        marginBottom: 10,
        paddingBottom: 5,
        borderBottom: '2 solid #E5E7EB',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    col: {
        flex: 1,
    },
    label: {
        fontSize: 9,
        color: '#6B7280',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 11,
        color: '#111827',
        fontFamily: 'Helvetica-Bold',
    },
    valueNormal: {
        fontSize: 10,
        color: '#111827',
    },
    table: {
        marginTop: 10,
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        padding: 10,
        fontFamily: 'Helvetica-Bold',
        fontSize: 9,
        color: '#374151',
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '1 solid #E5E7EB',
        padding: 12,
        fontSize: 10,
    },
    tableCol: {
        flex: 1,
    },
    tableColWide: {
        flex: 3,
    },
    tableColNarrow: {
        flex: 0.5,
    },
    tableColRight: {
        flex: 1,
        textAlign: 'right',
    },
    features: {
        marginTop: 5,
        paddingLeft: 5,
    },
    feature: {
        fontSize: 9,
        color: '#6B7280',
        marginBottom: 3,
    },
    totalSection: {
        marginTop: 20,
        paddingTop: 15,
        borderTop: '2 solid #E5E7EB',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    totalLabel: {
        fontSize: 11,
        color: '#374151',
    },
    totalValue: {
        fontSize: 11,
        color: '#111827',
    },
    grandTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingTop: 10,
        borderTop: '2 solid #111827',
    },
    grandTotalLabel: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        color: '#111827',
    },
    grandTotalValue: {
        fontSize: 16,
        fontFamily: 'Helvetica-Bold',
        color: '#2563EB',
    },
    paidBadge: {
        backgroundColor: '#10B981',
        color: '#FFFFFF',
        padding: '5 10',
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        borderRadius: 4,
        textAlign: 'center',
        marginTop: 5,
    },
    terms: {
        marginTop: 30,
        padding: 15,
        backgroundColor: '#F9FAFB',
        borderRadius: 4,
    },
    termsTitle: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        color: '#111827',
        marginBottom: 8,
    },
    termsList: {
        fontSize: 9,
        color: '#6B7280',
        lineHeight: 1.6,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 9,
        color: '#9CA3AF',
        paddingTop: 15,
        borderTop: '1 solid #E5E7EB',
    },
});

export const InvoiceTemplate: React.FC<{ data: InvoiceData }> = ({ data }) => {
    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(date);
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.logo}>LAWethic</Text>
                            <Text style={styles.companyInfo}>Compliance Services</Text>
                            <Text style={styles.companyInfo}>India</Text>
                            <Text style={styles.companyInfo}>support@lawethic.com</Text>
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.invoiceTitle}>INVOICE</Text>
                            <Text style={styles.invoiceDetails}>#{data.invoiceNumber}</Text>
                            <Text style={styles.invoiceDetails}>{formatDate(data.invoiceDate)}</Text>
                        </View>
                    </View>
                </View>

                {/* Bill To Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>BILL TO</Text>
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Customer Name</Text>
                            <Text style={styles.value}>{data.customerName}</Text>
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.label}>Order Number</Text>
                            <Text style={styles.value}>{data.orderNumber}</Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Email</Text>
                            <Text style={styles.valueNormal}>{data.customerEmail}</Text>
                        </View>
                        <View style={styles.col}>
                            {data.customerPhone && (
                                <>
                                    <Text style={styles.label}>Phone</Text>
                                    <Text style={styles.valueNormal}>{data.customerPhone}</Text>
                                </>
                            )}
                        </View>
                    </View>
                    {data.businessName && (
                        <View>
                            <Text style={styles.label}>Business Name</Text>
                            <Text style={styles.valueNormal}>{data.businessName}</Text>
                        </View>
                    )}
                </View>

                {/* Service Details Table */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SERVICE DETAILS</Text>
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={styles.tableColWide}>Description</Text>
                            <Text style={styles.tableColNarrow}>Qty</Text>
                            <Text style={styles.tableColRight}>Amount</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <View style={styles.tableColWide}>
                                <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 5 }}>
                                    {data.serviceName}
                                </Text>
                                <Text style={{ fontSize: 9, color: '#6B7280', marginBottom: 5 }}>
                                    {data.serviceDescription}
                                </Text>
                                {data.features && data.features.length > 0 && (
                                    <View style={styles.features}>
                                        {data.features.slice(0, 4).map((feature, index) => (
                                            <Text key={index} style={styles.feature}>
                                                • {feature}
                                            </Text>
                                        ))}
                                    </View>
                                )}
                            </View>
                            <Text style={styles.tableColNarrow}>1</Text>
                            <Text style={styles.tableColRight}>{formatCurrency(data.amount)}</Text>
                        </View>
                    </View>
                </View>

                {/* Total Section */}
                <View style={styles.totalSection}>
                    <View style={styles.grandTotal}>
                        <Text style={styles.grandTotalLabel}>TOTAL AMOUNT</Text>
                        <Text style={styles.grandTotalValue}>{formatCurrency(data.amount)}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.paidBadge}>✓ PAID</Text>
                    </View>
                </View>

                {/* Payment Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PAYMENT DETAILS</Text>
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Payment Method</Text>
                            <Text style={styles.valueNormal}>{data.paymentMethod}</Text>
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.label}>Transaction ID</Text>
                            <Text style={styles.valueNormal}>{data.transactionId}</Text>
                        </View>
                    </View>
                    <View>
                        <Text style={styles.label}>Payment Date</Text>
                        <Text style={styles.valueNormal}>{formatDate(data.paymentDate)}</Text>
                    </View>
                </View>

                {/* Terms & Conditions */}
                <View style={styles.terms}>
                    <Text style={styles.termsTitle}>TERMS & CONDITIONS</Text>
                    <Text style={styles.termsList}>
                        • All payments are non-refundable{'\n'}
                        • Service commences upon receipt of all required documents{'\n'}
                        • Processing timeline is subject to government/regulatory processing times{'\n'}
                        • For any queries, please contact support@lawethic.com
                    </Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Thank you for your business!</Text>
                    <Text>LAWethic Compliance Services</Text>
                </View>
            </Page>
        </Document>
    );
};

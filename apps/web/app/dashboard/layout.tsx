import CustomerDashboardLayout from '@/components/customer/CustomerDashboardLayout';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <CustomerDashboardLayout>{children}</CustomerDashboardLayout>;
}

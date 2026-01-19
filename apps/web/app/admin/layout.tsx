import type { Metadata } from 'next';
import AdminLayoutWrapper from './AdminLayoutWrapper';

export const metadata: Metadata = {
    title: 'Admin - LawEthic',
    description: 'Admin panel for LawEthic compliance services',
};

export default function AdminRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}

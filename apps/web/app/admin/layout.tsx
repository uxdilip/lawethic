import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin - LawEthic',
    description: 'Admin panel for LawEthic compliance services',
};

export default function AdminRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Admin pages use AdminLayout component which has its own navbar
    // No global Header here to avoid duplicate navbars
    return <>{children}</>;
}

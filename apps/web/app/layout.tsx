import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ConditionalHeader } from '@/components/ConditionalHeader';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'LawEthic - Compliance Services Platform',
    description: 'Traditional compliance services for GST, Trademark, Company Registration and more',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ConditionalHeader />
                {children}
                <Toaster />
            </body>
        </html>
    );
}

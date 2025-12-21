import type { Metadata } from 'next';
import { Inter, Playfair_Display, Montserrat } from 'next/font/google';
import './globals.css';
import { ConditionalHeader } from '@/components/ConditionalHeader';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });
const playfairDisplay = Playfair_Display({
    subsets: ['latin'],
    weight: ['500'],
    variable: '--font-playfair'
});
const montserrat = Montserrat({
    subsets: ['latin'],
    weight: ['500'],
    variable: '--font-montserrat'
});

export const metadata: Metadata = {
    title: 'LAWethic - Compliance Services Platform',
    description: 'Traditional compliance services for GST, Trademark, Company Registration and more',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} ${playfairDisplay.variable} ${montserrat.variable}`}>
                <ConditionalHeader />
                {children}
                <Toaster />
            </body>
        </html>
    );
}

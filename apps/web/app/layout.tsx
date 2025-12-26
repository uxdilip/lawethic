import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display, Montserrat } from 'next/font/google';
import './globals.css';
import { ConditionalHeader } from '@/components/ConditionalHeader';
import { Toaster } from '@/components/ui/toaster';
import { OrganizationSchema, WebsiteSchema } from '@/components/StructuredData';

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

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://lawethic.com';

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    themeColor: '#1e40af',
};

export const metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
    title: {
        default: 'LAWethic - India\'s Trusted Business Registration & Compliance Platform',
        template: '%s | LAWethic',
    },
    description: 'India\'s leading platform for Trademark Registration, FSSAI License, Trade License, MSME Registration & more. Expert CA/CS professionals. 100% online process. Starting ₹999.',
    keywords: [
        'trademark registration',
        'FSSAI license',
        'trade license',
        'MSME registration',
        'Udyam registration',
        'IEC registration',
        'business registration India',
        'compliance services',
        'CA services online',
        'legal services India',
    ],
    authors: [{ name: 'LAWethic' }],
    creator: 'LAWethic',
    publisher: 'LAWethic',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: BASE_URL,
        siteName: 'LAWethic',
        title: 'LAWethic - India\'s Trusted Business Registration & Compliance Platform',
        description: 'Expert Trademark, FSSAI, Trade License & business registration services. 50,000+ businesses served. 100% online. Starting ₹999.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'LAWethic - Business Registration & Compliance Services',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'LAWethic - Business Registration & Compliance',
        description: 'Expert Trademark, FSSAI, Trade License & business registration services. 50,000+ businesses served.',
        images: ['/og-image.png'],
        creator: '@lawethic',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        // Add these after setting up Google Search Console
        // google: 'your-google-verification-code',
        // yandex: 'your-yandex-verification-code',
    },
    alternates: {
        canonical: BASE_URL,
    },
    category: 'Legal Services',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                {/* Structured Data for SEO */}
                <OrganizationSchema />
                <WebsiteSchema />

                {/* Favicon */}
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <link rel="icon" href="/icon.svg" type="image/svg+xml" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <link rel="manifest" href="/manifest.json" />
            </head>
            <body className={`${inter.className} ${playfairDisplay.variable} ${montserrat.variable}`}>
                <ConditionalHeader />
                {children}
                <Toaster />
            </body>
        </html>
    );
}

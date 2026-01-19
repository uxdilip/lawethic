import type { Metadata } from 'next';
import ExpertLayoutWrapper from './ExpertLayoutWrapper';

export const metadata: Metadata = {
    title: 'Expert Panel - LawEthic',
    description: 'Expert consultation panel for LawEthic',
};

export default function ExpertRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ExpertLayoutWrapper>{children}</ExpertLayoutWrapper>;
}

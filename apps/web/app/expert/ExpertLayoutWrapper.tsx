'use client';

import { usePathname } from 'next/navigation';
import ExpertLayout from '@/components/expert/ExpertLayout';
import { ExpertOnly } from '@/components/RoleGuard';

// Pages that should NOT use ExpertLayout (like login)
const EXCLUDED_PATHS = ['/expert/login'];

interface ExpertLayoutWrapperProps {
    children: React.ReactNode;
}

export default function ExpertLayoutWrapper({ children }: ExpertLayoutWrapperProps) {
    const pathname = usePathname();

    // Skip layout for excluded paths
    if (EXCLUDED_PATHS.some(path => pathname.startsWith(path))) {
        return <>{children}</>;
    }

    return (
        <ExpertOnly>
            <ExpertLayout>{children}</ExpertLayout>
        </ExpertOnly>
    );
}

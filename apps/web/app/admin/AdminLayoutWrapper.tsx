'use client';

import { usePathname } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { StaffOnly } from '@/components/RoleGuard';

// Pages that should NOT use AdminLayout (like login)
const EXCLUDED_PATHS = ['/admin/login', '/admin/register'];

interface AdminLayoutWrapperProps {
    children: React.ReactNode;
}

export default function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
    const pathname = usePathname();

    // Skip layout for excluded paths
    if (EXCLUDED_PATHS.some(path => pathname.startsWith(path))) {
        return <>{children}</>;
    }

    return (
        <StaffOnly>
            <AdminLayout>{children}</AdminLayout>
        </StaffOnly>
    );
}

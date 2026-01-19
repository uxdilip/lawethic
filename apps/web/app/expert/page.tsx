'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ExpertPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/expert/dashboard');
    }, [router]);

    return null;
}

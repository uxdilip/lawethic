'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, History, RotateCcw, Loader2, Check, AlertCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface VersionEntry {
    $id: string;
    version: number;
    status: 'draft' | 'published';
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    editedBy?: string;
    changeNote?: string;
}

export default function ServiceHistoryPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [loading, setLoading] = useState(true);
    const [reverting, setReverting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [versions, setVersions] = useState<VersionEntry[]>([]);
    const [serviceTitle, setServiceTitle] = useState('');
    const [revertTarget, setRevertTarget] = useState<number | null>(null);

    // Load version history
    useEffect(() => {
        async function loadHistory() {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch(`/api/admin/services/${slug}/history`);
                if (!res.ok) throw new Error('Failed to load history');

                const data = await res.json();
                setVersions(data.versions || []);
                setServiceTitle(data.serviceTitle || slug);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load');
            } finally {
                setLoading(false);
            }
        }

        loadHistory();
    }, [slug]);

    // Handle revert
    const handleRevert = async () => {
        if (revertTarget === null) return;

        try {
            setReverting(true);
            setError(null);

            const res = await fetch(`/api/admin/services/${slug}/revert/${revertTarget}`, {
                method: 'POST',
            });

            if (!res.ok) throw new Error('Failed to revert');

            // Redirect to editor
            router.push(`/admin/services/${slug}/edit`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to revert');
            setReverting(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return {
            date: date.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            }),
            time: date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit'
            }),
        };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/admin/services/${slug}/edit`}
                            className="text-neutral-500 hover:text-neutral-700"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="font-semibold text-neutral-900 flex items-center gap-2">
                                <History className="h-5 w-5" />
                                Version History
                            </h1>
                            <p className="text-sm text-neutral-500">{serviceTitle}</p>
                        </div>
                    </div>

                    <Link href={`/admin/services/${slug}/edit`}>
                        <Button variant="outline">
                            Back to Editor
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-3xl mx-auto p-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                        <AlertCircle className="h-5 w-5" />
                        {error}
                    </div>
                )}

                {versions.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border">
                        <History className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                        <h2 className="text-lg font-medium text-neutral-900 mb-2">No Version History</h2>
                        <p className="text-neutral-500 mb-4">
                            This service hasn&apos;t been edited yet.
                        </p>
                        <Link href={`/admin/services/${slug}/edit`}>
                            <Button>Start Editing</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border divide-y">
                        {versions.map((entry, index) => {
                            const { date, time } = formatDate(entry.createdAt);
                            const isCurrent = index === 0;

                            return (
                                <div
                                    key={entry.$id}
                                    className={cn(
                                        'p-4 flex items-center gap-4',
                                        isCurrent && 'bg-brand-50/50'
                                    )}
                                >
                                    <div className={cn(
                                        'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium',
                                        entry.status === 'published'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-neutral-100 text-neutral-600'
                                    )}>
                                        v{entry.version}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-neutral-900">
                                                Version {entry.version}
                                            </span>
                                            {isCurrent && (
                                                <Badge variant="outline" className="text-xs">
                                                    Current
                                                </Badge>
                                            )}
                                            <Badge
                                                className={cn(
                                                    'text-xs',
                                                    entry.status === 'published'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-neutral-100 text-neutral-600'
                                                )}
                                            >
                                                {entry.status === 'published' ? 'Published' : 'Draft'}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-neutral-500 mt-0.5">
                                            {date} at {time}
                                            {entry.publishedAt && entry.status === 'published' && (
                                                <span className="ml-2 text-green-600">
                                                    • Published {formatDate(entry.publishedAt).date}
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {!isCurrent && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setRevertTarget(entry.version)}
                                                disabled={reverting}
                                            >
                                                <RotateCcw className="h-4 w-4 mr-2" />
                                                Revert
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Revert Confirmation Dialog */}
            <AlertDialog open={revertTarget !== null} onOpenChange={() => setRevertTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Revert to Version {revertTarget}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will create a new draft with the content from version {revertTarget}.
                            Your current draft will be preserved in the version history.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={reverting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRevert}
                            disabled={reverting}
                        >
                            {reverting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Reverting...
                                </>
                            ) : (
                                'Revert'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

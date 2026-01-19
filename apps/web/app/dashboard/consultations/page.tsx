'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { account, databases, appwriteConfig } from '@lawethic/appwrite';
import {
    MessageSquare,
    Clock,
    CheckCircle,
    Calendar,
    Search,
    Plus,
    ArrowRight,
    FileText,
    XCircle,
    UserCheck,
} from 'lucide-react';
import { Query } from 'appwrite';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    ConsultationCase,
    ConsultationStatus,
    CASE_TYPE_LABELS,
    BUSINESS_TYPE_LABELS,
} from '@lawethic/appwrite/types';

const STATUS_CONFIG: Record<
    ConsultationStatus,
    { label: string; color: string; icon: React.ComponentType<any> }
> = {
    submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700', icon: FileText },
    under_review: { label: 'Under Review', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    pending_assignment: { label: 'Pending Assignment', color: 'bg-orange-100 text-orange-700', icon: UserCheck },
    meeting_scheduled: { label: 'Meeting Scheduled', color: 'bg-purple-100 text-purple-700', icon: Calendar },
    meeting_completed: { label: 'Meeting Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    recommendations_sent: { label: 'Recommendations Ready', color: 'bg-emerald-100 text-emerald-700', icon: MessageSquare },
    converted: { label: 'Converted', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
    closed: { label: 'Closed', color: 'bg-gray-100 text-gray-700', icon: CheckCircle },
};

const STATUS_FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
];

export default function ConsultationsPage() {
    const [cases, setCases] = useState<ConsultationCase[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadCases();
    }, []);

    const loadCases = async () => {
        try {
            const userData = await account.get();

            // Query by customerId (for logged-in submissions)
            const byIdResponse = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.consultationCases,
                [
                    Query.equal('customerId', userData.$id),
                    Query.orderDesc('$createdAt'),
                    Query.limit(100),
                ]
            );

            // Also query by email (for guest submissions that match user's email)
            const byEmailResponse = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.consultationCases,
                [
                    Query.equal('customerEmail', userData.email),
                    Query.orderDesc('$createdAt'),
                    Query.limit(100),
                ]
            );

            // Merge and deduplicate results
            const allCases = [...byIdResponse.documents, ...byEmailResponse.documents];
            const uniqueCases = allCases.filter((case_, index, self) =>
                index === self.findIndex(c => c.$id === case_.$id)
            );

            // Sort by creation date
            uniqueCases.sort((a, b) =>
                new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
            );

            setCases(uniqueCases as unknown as ConsultationCase[]);
        } catch (error) {
            console.error('Error loading consultations:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCases = cases.filter((c) => {
        // Apply status filter
        if (activeFilter === 'active') {
            if (['converted', 'closed'].includes(c.status)) return false;
        } else if (activeFilter === 'completed') {
            if (!['converted', 'closed', 'recommendations_sent'].includes(c.status)) return false;
        }

        // Apply search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                c.caseNumber.toLowerCase().includes(query) ||
                c.title.toLowerCase().includes(query) ||
                CASE_TYPE_LABELS[c.caseType]?.toLowerCase().includes(query)
            );
        }

        return true;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Consultations</h1>
                    <p className="text-gray-500">Track your consultation requests and meetings</p>
                </div>
                <Link href="/dashboard/consultations/new">
                    <Button className="bg-brand-600 hover:bg-brand-700">
                        <Plus className="mr-2 h-4 w-4" />
                        New Consultation
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex gap-2">
                    {STATUS_FILTERS.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                activeFilter === filter.id
                                    ? 'bg-brand-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            )}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by case number or title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Cases List */}
            {filteredCases.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {cases.length === 0
                            ? 'No consultations yet'
                            : 'No matching consultations'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                        {cases.length === 0
                            ? 'Get free guidance on your business requirements'
                            : 'Try adjusting your filters or search'}
                    </p>
                    {cases.length === 0 && (
                        <Link href="/consult-expert">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Start Free Consultation
                            </Button>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredCases.map((caseItem) => {
                        const statusConfig = STATUS_CONFIG[caseItem.status];
                        const StatusIcon = statusConfig?.icon || FileText;

                        return (
                            <Link
                                key={caseItem.$id}
                                href={`/dashboard/consultations/${caseItem.$id}`}
                                className="block"
                            >
                                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-mono text-gray-500">
                                                    {caseItem.caseNumber}
                                                </span>
                                                <span
                                                    className={cn(
                                                        'px-2 py-0.5 rounded-full text-xs font-medium',
                                                        statusConfig?.color
                                                    )}
                                                >
                                                    {statusConfig?.label}
                                                </span>
                                            </div>
                                            <h3 className="font-medium text-gray-900 truncate">
                                                {caseItem.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {CASE_TYPE_LABELS[caseItem.caseType]} •{' '}
                                                {formatDate(caseItem.$createdAt)}
                                            </p>
                                            {caseItem.scheduledAt && (
                                                <p className="text-sm text-purple-600 mt-1 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    Meeting: {formatDate(caseItem.scheduledAt)}
                                                </p>
                                            )}
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

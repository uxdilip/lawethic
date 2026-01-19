'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { databases } from '@lawethic/appwrite/client';
import { appwriteConfig } from '@lawethic/appwrite/config';
import { Query } from 'appwrite';
import {
    Search,
    Calendar,
    Clock,
    MessageSquare,
    Video,
    Loader2,
    Filter,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ConsultationCase, ConsultationStatus, BUSINESS_TYPE_LABELS } from '@lawethic/appwrite/types';

const STATUS_FILTERS: { value: string; label: string }[] = [
    { value: 'all', label: 'All Cases' },
    { value: 'meeting_scheduled', label: 'Scheduled' },
    { value: 'meeting_completed', label: 'Pending Recommendations' },
    { value: 'recommendations_sent', label: 'Completed' },
    { value: 'closed', label: 'Closed' },
];

export default function ExpertConsultationsPage() {
    const searchParams = useSearchParams();
    const initialStatus = searchParams.get('status') || 'all';

    const [loading, setLoading] = useState(true);
    const [consultations, setConsultations] = useState<ConsultationCase[]>([]);
    const [filteredConsultations, setFilteredConsultations] = useState<ConsultationCase[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState(initialStatus);

    useEffect(() => {
        loadConsultations();
    }, []);

    useEffect(() => {
        filterConsultations();
    }, [consultations, searchQuery, statusFilter]);

    const loadConsultations = async () => {
        try {
            const response = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.consultationCases,
                [
                    Query.orderDesc('$createdAt'),
                    Query.limit(100),
                ]
            );

            setConsultations(response.documents as unknown as ConsultationCase[]);
        } catch (error) {
            console.error('Failed to load consultations:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterConsultations = () => {
        let filtered = [...consultations];

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(c => c.status === statusFilter);
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(c =>
                c.caseNumber?.toLowerCase().includes(query) ||
                c.customerName?.toLowerCase().includes(query) ||
                c.customerEmail?.toLowerCase().includes(query) ||
                c.title?.toLowerCase().includes(query)
            );
        }

        setFilteredConsultations(filtered);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const getStatusColor = (status: ConsultationStatus) => {
        const colors: Record<ConsultationStatus, string> = {
            submitted: 'bg-gray-100 text-gray-700',
            under_review: 'bg-blue-50 text-blue-700',
            pending_assignment: 'bg-orange-50 text-orange-700',
            meeting_scheduled: 'bg-purple-50 text-purple-700',
            meeting_completed: 'bg-amber-50 text-amber-700',
            recommendations_sent: 'bg-emerald-50 text-emerald-700',
            converted: 'bg-green-50 text-green-700',
            cancelled: 'bg-red-50 text-red-600',
            closed: 'bg-neutral-100 text-neutral-600',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getStatusLabel = (status: ConsultationStatus) => {
        const labels: Record<ConsultationStatus, string> = {
            submitted: 'Submitted',
            under_review: 'Under Review',
            pending_assignment: 'Pending',
            meeting_scheduled: 'Meeting Scheduled',
            meeting_completed: 'Awaiting Recommendations',
            recommendations_sent: 'Completed',
            converted: 'Converted',
            cancelled: 'Cancelled',
            closed: 'Closed',
        };
        return labels[status] || status;
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-64px)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Consultations</h1>
                    <p className="text-neutral-500 mt-1">
                        {filteredConsultations.length} of {consultations.length} cases
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                        placeholder="Search by name, email, or case number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex gap-2 flex-wrap">
                    {STATUS_FILTERS.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setStatusFilter(filter.value)}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                                statusFilter === filter.value
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
                            )}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Consultations List */}
            <div className="bg-white rounded-xl border border-neutral-200">
                {filteredConsultations.length === 0 ? (
                    <div className="text-center py-16">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                        <p className="text-neutral-600 font-medium">No consultations found</p>
                        <p className="text-neutral-400 text-sm mt-1">
                            {searchQuery || statusFilter !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Cases assigned to you will appear here'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-neutral-100">
                        {filteredConsultations.map((consultation) => (
                            <Link
                                key={consultation.$id}
                                href={`/expert/consultations/${consultation.$id}`}
                                className="flex items-center gap-4 p-5 hover:bg-neutral-50 transition-colors group"
                            >
                                {/* Case Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-semibold text-neutral-900">
                                            {consultation.caseNumber}
                                        </span>
                                        <span className={cn(
                                            "px-2 py-0.5 text-xs font-medium rounded-full",
                                            getStatusColor(consultation.status)
                                        )}>
                                            {getStatusLabel(consultation.status)}
                                        </span>
                                    </div>
                                    <p className="text-neutral-700 truncate">
                                        {consultation.title}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                                        <span>{consultation.customerName}</span>
                                        <span className="text-neutral-300">•</span>
                                        <span>{BUSINESS_TYPE_LABELS[consultation.businessType] || consultation.businessType}</span>
                                    </div>
                                </div>

                                {/* Meeting Info */}
                                {consultation.status === 'meeting_scheduled' && consultation.scheduledAt && (
                                    <div className="hidden md:flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(consultation.scheduledAt)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                                            <Clock className="w-4 h-4" />
                                            <span>{formatTime(consultation.scheduledAt)}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Join Button */}
                                {consultation.status === 'meeting_scheduled' && consultation.meetingLink && (
                                    <a
                                        href={consultation.meetingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                                    >
                                        <Video className="w-4 h-4" />
                                        <span className="text-sm font-medium">Join</span>
                                    </a>
                                )}

                                {/* Arrow */}
                                <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-neutral-400 transition-colors" />
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

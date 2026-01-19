'use client';

import { useEffect, useState } from 'react';
import { databases, account } from '@lawethic/appwrite/client';
import { appwriteConfig } from '@lawethic/appwrite/config';
import { Query } from 'appwrite';
import Link from 'next/link';
import { format } from 'date-fns';
import {
    Search, Filter, Eye, Calendar, Clock, User,
    MessageSquare, CheckCircle2, AlertCircle, XCircle, Loader,
    ChevronLeft, ChevronRight, ArrowUpRight, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    ConsultationCase,
    ConsultationStatus,
    CASE_TYPE_LABELS,
    BUSINESS_TYPE_LABELS
} from '@lawethic/appwrite/types';

interface FilterState {
    status: string;
    search: string;
    dateFrom: string;
    dateTo: string;
}

export default function AdminConsultationsPage() {
    const [cases, setCases] = useState<ConsultationCase[]>([]);
    const [filteredCases, setFilteredCases] = useState<ConsultationCase[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState<FilterState>({
        status: 'all',
        search: '',
        dateFrom: '',
        dateTo: '',
    });

    const itemsPerPage = 20;

    useEffect(() => {
        loadCases();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, cases]);

    const loadCases = async () => {
        try {
            setLoading(true);
            const response = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.consultationCases,
                [Query.orderDesc('$createdAt'), Query.limit(1000)]
            );
            setCases(response.documents as unknown as ConsultationCase[]);
        } catch (error) {
            console.error('Failed to load consultation cases:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...cases];

        // Status filter
        if (filters.status !== 'all') {
            filtered = filtered.filter(c => c.status === filters.status);
        }

        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(c =>
                c.caseNumber?.toLowerCase().includes(searchLower) ||
                c.customerName?.toLowerCase().includes(searchLower) ||
                c.customerEmail?.toLowerCase().includes(searchLower) ||
                c.title?.toLowerCase().includes(searchLower)
            );
        }

        // Date range filter
        if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom);
            filtered = filtered.filter(c => new Date(c.$createdAt) >= fromDate);
        }
        if (filters.dateTo) {
            const toDate = new Date(filters.dateTo);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(c => new Date(c.$createdAt) <= toDate);
        }

        setFilteredCases(filtered);
        setCurrentPage(1);
    };

    const getStatusConfig = (status: ConsultationStatus) => {
        const configs: Record<ConsultationStatus, { color: string; icon: any; label: string }> = {
            submitted: {
                color: 'bg-blue-50 text-blue-700 border-blue-200',
                icon: AlertCircle,
                label: 'New Submission'
            },
            under_review: {
                color: 'bg-purple-50 text-purple-700 border-purple-200',
                icon: Loader,
                label: 'Under Review'
            },
            meeting_scheduled: {
                color: 'bg-amber-50 text-amber-700 border-amber-200',
                icon: Calendar,
                label: 'Meeting Scheduled'
            },
            meeting_completed: {
                color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
                icon: Clock,
                label: 'Meeting Completed'
            },
            recommendations_sent: {
                color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                icon: MessageSquare,
                label: 'Recommendations Sent'
            },
            converted: {
                color: 'bg-green-50 text-green-700 border-green-200',
                icon: CheckCircle2,
                label: 'Converted'
            },
            cancelled: {
                color: 'bg-red-50 text-red-700 border-red-200',
                icon: XCircle,
                label: 'Cancelled'
            },
            pending_assignment: {
                color: 'bg-orange-50 text-orange-700 border-orange-200',
                icon: Clock,
                label: 'Pending Assignment'
            },
            closed: {
                color: 'bg-neutral-50 text-neutral-700 border-neutral-200',
                icon: XCircle,
                label: 'Closed'
            },
        };
        return configs[status] || {
            color: 'bg-neutral-100 text-neutral-700 border-neutral-200',
            icon: AlertCircle,
            label: status
        };
    };

    const getStatsCounts = () => {
        return {
            all: cases.length,
            submitted: cases.filter(c => c.status === 'submitted').length,
            meeting_scheduled: cases.filter(c => c.status === 'meeting_scheduled').length,
            converted: cases.filter(c => c.status === 'converted').length,
        };
    };

    const stats = getStatsCounts();

    // Pagination
    const totalPages = Math.ceil(filteredCases.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedCases = filteredCases.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-neutral-900">Consultations</h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        Manage free consultation requests from customers
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                    onClick={() => setFilters(f => ({ ...f, status: 'all' }))}
                    className={cn(
                        "p-4 rounded-xl border transition-all text-left",
                        filters.status === 'all'
                            ? "bg-neutral-900 text-white border-neutral-900"
                            : "bg-white border-neutral-200 hover:border-neutral-300"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            filters.status === 'all' ? "bg-white/10" : "bg-neutral-100"
                        )}>
                            <Users className={cn("w-5 h-5", filters.status === 'all' ? "text-white" : "text-neutral-600")} />
                        </div>
                        <div>
                            <p className={cn("text-2xl font-bold", filters.status === 'all' ? "text-white" : "text-neutral-900")}>
                                {stats.all}
                            </p>
                            <p className={cn("text-sm", filters.status === 'all' ? "text-white/70" : "text-neutral-500")}>
                                All Cases
                            </p>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => setFilters(f => ({ ...f, status: 'submitted' }))}
                    className={cn(
                        "p-4 rounded-xl border transition-all text-left",
                        filters.status === 'submitted'
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white border-neutral-200 hover:border-blue-300"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            filters.status === 'submitted' ? "bg-white/10" : "bg-blue-50"
                        )}>
                            <AlertCircle className={cn("w-5 h-5", filters.status === 'submitted' ? "text-white" : "text-blue-600")} />
                        </div>
                        <div>
                            <p className={cn("text-2xl font-bold", filters.status === 'submitted' ? "text-white" : "text-neutral-900")}>
                                {stats.submitted}
                            </p>
                            <p className={cn("text-sm", filters.status === 'submitted' ? "text-white/70" : "text-neutral-500")}>
                                New Requests
                            </p>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => setFilters(f => ({ ...f, status: 'meeting_scheduled' }))}
                    className={cn(
                        "p-4 rounded-xl border transition-all text-left",
                        filters.status === 'meeting_scheduled'
                            ? "bg-amber-600 text-white border-amber-600"
                            : "bg-white border-neutral-200 hover:border-amber-300"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            filters.status === 'meeting_scheduled' ? "bg-white/10" : "bg-amber-50"
                        )}>
                            <Calendar className={cn("w-5 h-5", filters.status === 'meeting_scheduled' ? "text-white" : "text-amber-600")} />
                        </div>
                        <div>
                            <p className={cn("text-2xl font-bold", filters.status === 'meeting_scheduled' ? "text-white" : "text-neutral-900")}>
                                {stats.meeting_scheduled}
                            </p>
                            <p className={cn("text-sm", filters.status === 'meeting_scheduled' ? "text-white/70" : "text-neutral-500")}>
                                Scheduled
                            </p>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => setFilters(f => ({ ...f, status: 'converted' }))}
                    className={cn(
                        "p-4 rounded-xl border transition-all text-left",
                        filters.status === 'converted'
                            ? "bg-green-600 text-white border-green-600"
                            : "bg-white border-neutral-200 hover:border-green-300"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            filters.status === 'converted' ? "bg-white/10" : "bg-green-50"
                        )}>
                            <CheckCircle2 className={cn("w-5 h-5", filters.status === 'converted' ? "text-white" : "text-green-600")} />
                        </div>
                        <div>
                            <p className={cn("text-2xl font-bold", filters.status === 'converted' ? "text-white" : "text-neutral-900")}>
                                {stats.converted}
                            </p>
                            <p className={cn("text-sm", filters.status === 'converted' ? "text-white/70" : "text-neutral-500")}>
                                Converted
                            </p>
                        </div>
                    </div>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[240px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search by case number, name, email..."
                            value={filters.search}
                            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        />
                    </div>

                    {/* Date From */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-neutral-500">From:</label>
                        <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>

                    {/* Date To */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-neutral-500">To:</label>
                        <input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>

                    {/* Clear Filters */}
                    {(filters.search || filters.dateFrom || filters.dateTo || filters.status !== 'all') && (
                        <button
                            onClick={() => setFilters({ status: 'all', search: '', dateFrom: '', dateTo: '' })}
                            className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <Loader className="w-8 h-8 animate-spin text-neutral-400 mx-auto" />
                        <p className="text-neutral-500 mt-2">Loading consultations...</p>
                    </div>
                ) : filteredCases.length === 0 ? (
                    <div className="p-12 text-center">
                        <MessageSquare className="w-12 h-12 text-neutral-300 mx-auto" />
                        <p className="text-neutral-500 mt-2">No consultation cases found</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                                    Case
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                                    Submitted
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {paginatedCases.map((caseItem) => {
                                const statusConfig = getStatusConfig(caseItem.status);
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <tr key={caseItem.$id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div>
                                                <p className="font-mono text-sm font-medium text-neutral-900">
                                                    {caseItem.caseNumber}
                                                </p>
                                                <p className="text-sm text-neutral-500 line-clamp-1 max-w-[200px]">
                                                    {caseItem.title}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-neutral-900">
                                                    {caseItem.customerName}
                                                </p>
                                                <p className="text-sm text-neutral-500">
                                                    {caseItem.customerEmail}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div>
                                                <p className="text-sm text-neutral-900">
                                                    {CASE_TYPE_LABELS[caseItem.caseType] || caseItem.caseType}
                                                </p>
                                                <p className="text-xs text-neutral-500">
                                                    {BUSINESS_TYPE_LABELS[caseItem.businessType] || caseItem.businessType}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                                                statusConfig.color
                                            )}>
                                                <StatusIcon className="w-3.5 h-3.5" />
                                                {statusConfig.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="text-sm text-neutral-600">
                                                {format(new Date(caseItem.$createdAt), 'MMM d, yyyy')}
                                            </p>
                                            <p className="text-xs text-neutral-400">
                                                {format(new Date(caseItem.$createdAt), 'h:mm a')}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <Link
                                                href={`/admin/consultations/${caseItem.$id}`}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-neutral-200 flex items-center justify-between">
                        <p className="text-sm text-neutral-500">
                            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCases.length)} of {filteredCases.length} results
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-neutral-600">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

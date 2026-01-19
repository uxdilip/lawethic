'use client';

import { useEffect, useState } from 'react';
import { databases, account } from '@lawethic/appwrite/client';
import { appwriteConfig } from '@lawethic/appwrite/config';
import { Query } from 'appwrite';


import DataTable from '@/components/admin/DataTable';
import Link from 'next/link';
import { format } from 'date-fns';
import {
    Filter, Download, Eye, MoreVertical, Search, X,
    Clock, FileText, CheckCircle2, AlertCircle,
    XCircle, Loader, Ban, CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FilterState {
    status: string;
    paymentStatus: string;
    search: string;
    dateFrom: string;
    dateTo: string;
    assignment: string; // New filter for assignment
}

export default function AdminCasesPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [userRole, setUserRole] = useState<string>('');
    const [teamMembers, setTeamMembers] = useState<Map<string, string>>(new Map());
    const [filters, setFilters] = useState<FilterState>({
        status: 'all',
        paymentStatus: 'all',
        search: '',
        dateFrom: '',
        dateTo: '',
        assignment: 'all',
    });

    const itemsPerPage = 20;

    useEffect(() => {
        loadUserAndOrders();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, orders, currentUser]);

    const loadUserAndOrders = async () => {
        try {
            setLoading(true);

            // Get current user and role
            const user = await account.get();
            setCurrentUser(user);
            const role = user.prefs?.role || 'customer';
            setUserRole(role);

            // Fetch team members for assignment display
            await fetchTeamMembers();

            // Load all orders
            const response = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                [Query.orderDesc('$createdAt'), Query.limit(1000)]
            );

            // Parse formData for each order
            const parsedOrders = response.documents.map(order => {
                if (typeof order.formData === 'string') {
                    try {
                        order.formData = JSON.parse(order.formData);
                    } catch (e) {
                        console.error('Error parsing formData:', e);
                    }
                }
                return order;
            });

            setOrders(parsedOrders);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeamMembers = async () => {
        try {
            const response = await fetch('/api/admin/team-members');
            const data = await response.json();

            if (data.success) {
                const membersMap = new Map();
                data.teamMembers.forEach((member: any) => {
                    membersMap.set(member.$id, member.name);
                });
                setTeamMembers(membersMap);
            }
        } catch (error) {
            console.error('Failed to fetch team members:', error);
        }
    };

    const applyFilters = () => {
        let filtered = [...orders];

        // Role-based filtering: Operations users see only their assigned cases
        if (userRole === 'operations' && currentUser) {
            filtered = filtered.filter(o => o.assignedTo === currentUser.$id);
        }

        // Assignment filter (for admins)
        if (filters.assignment !== 'all') {
            if (filters.assignment === 'unassigned') {
                filtered = filtered.filter(o => !o.assignedTo);
            } else if (filters.assignment === 'assigned') {
                filtered = filtered.filter(o => o.assignedTo);
            }
        }

        // Status filter
        if (filters.status !== 'all') {
            filtered = filtered.filter(o => o.status === filters.status);
        }

        // Payment status filter
        if (filters.paymentStatus !== 'all') {
            filtered = filtered.filter(o => o.paymentStatus === filters.paymentStatus);
        }

        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(o =>
                o.orderNumber?.toLowerCase().includes(searchLower) ||
                o.formData?.fullName?.toLowerCase().includes(searchLower) ||
                o.formData?.email?.toLowerCase().includes(searchLower) ||
                o.formData?.mobile?.toLowerCase().includes(searchLower)
            );
        }

        // Date range filter
        if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom);
            filtered = filtered.filter(o => new Date(o.$createdAt) >= fromDate);
        }
        if (filters.dateTo) {
            const toDate = new Date(filters.dateTo);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(o => new Date(o.$createdAt) <= toDate);
        }

        setFilteredOrders(filtered);
        setCurrentPage(1);
    };

    const getStatusConfig = (status: string) => {
        const configs: Record<string, { color: string; icon: any; label: string }> = {
            new: {
                color: 'bg-blue-50 text-blue-700 border-blue-200',
                icon: AlertCircle,
                label: 'New'
            },
            pending_docs: {
                color: 'bg-amber-50 text-amber-700 border-amber-200',
                icon: FileText,
                label: 'Pending Docs'
            },
            in_review: {
                color: 'bg-purple-50 text-purple-700 border-purple-200',
                icon: Loader,
                label: 'In Review'
            },
            ready_for_filing: {
                color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                icon: CheckCircle2,
                label: 'Ready for Filing'
            },
            submitted: {
                color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
                icon: CheckCircle2,
                label: 'Submitted'
            },
            pending_approval: {
                color: 'bg-orange-50 text-orange-700 border-orange-200',
                icon: Clock,
                label: 'Pending Approval'
            },
            completed: {
                color: 'bg-green-50 text-green-700 border-green-200',
                icon: CheckCircle2,
                label: 'Completed'
            },
            on_hold: {
                color: 'bg-red-50 text-red-700 border-red-200',
                icon: Ban,
                label: 'On Hold'
            },
        };
        return configs[status] || {
            color: 'bg-neutral-100 text-neutral-700 border-neutral-200',
            icon: AlertCircle,
            label: status.replace(/_/g, ' ')
        };
    };

    const getPaymentStatusConfig = (status: string) => {
        const configs: Record<string, { color: string; icon: any }> = {
            paid: { color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2 },
            pending: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
            failed: { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
            refunded: { color: 'bg-neutral-50 text-neutral-700 border-neutral-200', icon: CreditCard },
        };
        return configs[status] || { color: 'bg-neutral-100 text-neutral-700 border-neutral-200', icon: AlertCircle };
    };

    const handleDeleteSelected = async (selectedIds: string[]) => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} case(s)? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch('/api/admin/cases/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderIds: selectedIds }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(`Successfully deleted ${selectedIds.length} case(s)`);
                loadUserAndOrders();
            } else {
                throw new Error(data.error || 'Failed to delete');
            }
        } catch (error) {
            console.error('Failed to delete cases:', error);
            toast.error('Failed to delete cases. Please try again.');
        }
    };

    const handleAssignmentChange = async (orderId: string, assignedTo: string) => {
        try {
            const response = await fetch('/api/admin/cases/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, assignedTo: assignedTo || null }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Assignment updated successfully');
                loadUserAndOrders();
            } else {
                throw new Error(data.error || 'Failed to update');
            }
        } catch (error) {
            console.error('Failed to update assignment:', error);
            toast.error('Failed to update assignment. Please try again.');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const resetFilters = () => {
        setFilters({
            status: 'all',
            paymentStatus: 'all',
            search: '',
            dateFrom: '',
            dateTo: '',
            assignment: 'all',
        });
    };

    // DataTable columns configuration
    const columns = [
        {
            key: 'orderNumber',
            label: 'Order ID',
            sortable: true,
            render: (row: any) => (
                <div className="text-sm font-medium text-brand-600">
                    #{row.orderNumber}
                </div>
            ),
        },
        {
            key: 'customer',
            label: 'Customer',
            sortable: true,
            render: (row: any) => (
                <div>
                    <div className="text-sm font-medium text-neutral-900">
                        {row.formData?.fullName || 'N/A'}
                    </div>
                    <div className="text-xs text-neutral-500">
                        {row.formData?.email || 'N/A'}
                    </div>
                </div>
            ),
        },
        {
            key: '$createdAt',
            label: 'Date',
            sortable: true,
            render: (row: any) => (
                <div>
                    <div className="text-sm text-neutral-900">
                        {format(new Date(row.$createdAt), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-xs text-neutral-500">
                        {format(new Date(row.$createdAt), 'hh:mm a')}
                    </div>
                </div>
            ),
        },
        {
            key: 'amount',
            label: 'Amount',
            sortable: true,
            render: (row: any) => (
                <div className="text-sm font-semibold text-neutral-900">
                    {formatCurrency(row.amount || 0)}
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (row: any) => {
                const config = getStatusConfig(row.status);
                const Icon = config.icon;
                return (
                    <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border",
                        config.color
                    )}>
                        <Icon className="w-3.5 h-3.5" />
                        {config.label}
                    </span>
                );
            },
        },
        {
            key: 'paymentStatus',
            label: 'Payment',
            render: (row: any) => {
                const config = getPaymentStatusConfig(row.paymentStatus);
                const Icon = config.icon;
                return (
                    <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border capitalize",
                        config.color
                    )}>
                        <Icon className="w-3.5 h-3.5" />
                        {row.paymentStatus}
                    </span>
                );
            },
        },
        {
            key: 'assignedTo',
            label: 'Assigned To',
            render: (row: any) => (
                <div className="min-w-[160px]" onClick={(e) => e.stopPropagation()}>
                    <select
                        value={row.assignedTo || ''}
                        onChange={(e) => handleAssignmentChange(row.$id, e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-xs bg-white hover:border-neutral-300"
                    >
                        <option value="">Unassigned</option>
                        {Array.from(teamMembers.entries()).map(([id, name]) => (
                            <option key={id} value={id}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>
            ),
        },
    ];

    const rowActions = (row: any) => (
        <Link
            href={`/admin/cases/${row.$id}`}
            className="text-brand-600 hover:text-brand-700 font-medium text-sm transition-colors"
        >
            View →
        </Link>
    );

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentOrders = filteredOrders.slice(startIndex, endIndex);

    return (
        <>
            
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900">All Cases</h1>
                    <p className="mt-2 text-neutral-600">
                        Manage and track all customer orders
                    </p>
                </div>

                {/* Filters Card */}
                <div className="bg-white rounded-xl border border-neutral-200 shadow-sm mb-6 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-brand-100">
                                <Filter className="w-4 h-4 text-brand-600" />
                            </div>
                            <h3 className="text-base font-semibold text-neutral-900">Filters</h3>
                        </div>
                        {(filters.search || filters.status !== 'all' || filters.paymentStatus !== 'all' || filters.dateFrom || filters.dateTo || filters.assignment !== 'all') && (
                            <button
                                onClick={resetFilters}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4" />
                                Clear all
                            </button>
                        )}
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                            {/* Search */}
                            <div className="xl:col-span-2">
                                <label className="block text-xs font-medium text-neutral-600 mb-2">
                                    Search
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                    <input
                                        type="text"
                                        placeholder="Order ID, Name, Email, Phone..."
                                        value={filters.search}
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm bg-white hover:border-neutral-300"
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-2">
                                    Status
                                </label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm bg-white hover:border-neutral-300 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3E%3Cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27m6 8 4 4 4-4%27/%3E%3C/svg%3E')] bg-[position:right_0.5rem_center] bg-[size:1.5em_1.5em] bg-no-repeat pr-10"
                                >
                                    <option value="all">All Status</option>
                                    <option value="new">🆕 New</option>
                                    <option value="pending_docs">📄 Pending Docs</option>
                                    <option value="in_review">🔍 In Review</option>
                                    <option value="ready_for_filing">✅ Ready for Filing</option>
                                    <option value="submitted">📤 Submitted</option>
                                    <option value="pending_approval">⏳ Pending Approval</option>
                                    <option value="completed">✅ Completed</option>
                                    <option value="on_hold">🚫 On Hold</option>
                                </select>
                            </div>

                            {/* Payment Status Filter */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-2">
                                    Payment
                                </label>
                                <select
                                    value={filters.paymentStatus}
                                    onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm bg-white hover:border-neutral-300 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3E%3Cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27m6 8 4 4 4-4%27/%3E%3C/svg%3E')] bg-[position:right_0.5rem_center] bg-[size:1.5em_1.5em] bg-no-repeat pr-10"
                                >
                                    <option value="all">All Payments</option>
                                    <option value="pending">⏳ Pending</option>
                                    <option value="paid">✅ Paid</option>
                                    <option value="failed">❌ Failed</option>
                                    <option value="refunded">💰 Refunded</option>
                                </select>
                            </div>

                            {/* Date From */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-2">
                                    From Date
                                </label>
                                <input
                                    type="date"
                                    value={filters.dateFrom}
                                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm bg-white hover:border-neutral-300"
                                />
                            </div>

                            {/* Date To */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-2">
                                    To Date
                                </label>
                                <input
                                    type="date"
                                    value={filters.dateTo}
                                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm bg-white hover:border-neutral-300"
                                />
                            </div>

                            {/* Assignment Filter (Admin Only) */}
                            {userRole === 'admin' && (
                                <div>
                                    <label className="block text-xs font-medium text-neutral-600 mb-2">
                                        Assignment
                                    </label>
                                    <select
                                        value={filters.assignment}
                                        onChange={(e) => setFilters({ ...filters, assignment: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm bg-white hover:border-neutral-300 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3E%3Cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27m6 8 4 4 4-4%27/%3E%3C/svg%3E')] bg-[position:right_0.5rem_center] bg-[size:1.5em_1.5em] bg-no-repeat pr-10"
                                    >
                                        <option value="all">All Cases</option>
                                        <option value="assigned">👤 Assigned</option>
                                        <option value="unassigned">➖ Unassigned</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-neutral-200">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mb-4"></div>
                        <p className="text-neutral-600">Loading cases...</p>
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={filteredOrders}
                        rowActions={rowActions}
                        emptyMessage="No cases found"
                        pageSize={itemsPerPage}
                        onDelete={handleDeleteSelected}
                    />
                )}
            
        </>
    );
}

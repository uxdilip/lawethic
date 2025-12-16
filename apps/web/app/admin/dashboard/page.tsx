'use client';

import { useEffect, useState } from 'react';
import { databases, account } from '@lawethic/appwrite/client';
import { appwriteConfig } from '@lawethic/appwrite/config';
import { Query } from 'appwrite';
import AdminLayout from '@/components/AdminLayout';
import { StaffOnly } from '@/components/RoleGuard';
import StatCard from '@/components/admin/StatCard';
import Link from 'next/link';
import {
    ShoppingCart,
    DollarSign,
    Clock,
    CheckCircle2,
    FileText,
    ArrowRight,
    TrendingUp,
    AlertCircle,
    XCircle,
    Ban,
    Loader,
    CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Stats {
    newOrders: { count: number; amount: number };
    paymentReceived: { count: number };
    inProgress: { count: number };
    completedThisMonth: { count: number; revenue: number };
    pendingDocuments: { count: number };
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<Stats>({
        newOrders: { count: 0, amount: 0 },
        paymentReceived: { count: 0 },
        inProgress: { count: 0 },
        completedThisMonth: { count: 0, revenue: 0 },
        pendingDocuments: { count: 0 },
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Get current user and role
            const user = await account.get();
            setCurrentUser(user);
            const role = user.prefs?.role || 'customer';
            setUserRole(role);

            // Get all orders
            const ordersResponse = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                [Query.orderDesc('$createdAt'), Query.limit(100)]
            );

            let orders = ordersResponse.documents;

            // Role-based filtering: Operations users see only their assigned cases
            if (role === 'operations') {
                orders = orders.filter(o => o.assignedTo === user.$id);
            }

            // Calculate stats
            const newOrders = orders.filter(o => o.paymentStatus === 'pending');
            const paymentReceived = orders.filter(o => o.paymentStatus === 'paid' && o.status === 'new');
            const inProgress = orders.filter(o => ['in_review', 'ready_for_filing', 'submitted', 'pending_approval'].includes(o.status));

            // Get completed orders this month
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const completedThisMonth = orders.filter(o => {
                if (o.status !== 'completed') return false;
                const completedDate = o.completedAt ? new Date(o.completedAt) : new Date(o.$updatedAt);
                return completedDate >= firstDayOfMonth;
            });

            // Get documents needing review
            const documentsResponse = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.documents,
                [Query.equal('status', 'pending')]
            );

            setStats({
                newOrders: {
                    count: newOrders.length,
                    amount: newOrders.reduce((sum, o) => sum + (o.amount || 0), 0),
                },
                paymentReceived: {
                    count: paymentReceived.length,
                },
                inProgress: {
                    count: inProgress.length,
                },
                completedThisMonth: {
                    count: completedThisMonth.length,
                    revenue: completedThisMonth.reduce((sum, o) => sum + (o.amount || 0), 0),
                },
                pendingDocuments: {
                    count: documentsResponse.documents.length,
                },
            });

            // Get recent orders (last 5)
            setRecentOrders(orders.slice(0, 5));
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status: string) => {
        const configs: Record<string, { color: string; icon: any; label: string }> = {
            new: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: AlertCircle, label: 'New' },
            pending_docs: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: FileText, label: 'Pending Docs' },
            in_review: { color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Loader, label: 'In Review' },
            ready_for_filing: { color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: CheckCircle2, label: 'Ready for Filing' },
            submitted: { color: 'bg-cyan-50 text-cyan-700 border-cyan-200', icon: CheckCircle2, label: 'Submitted' },
            pending_approval: { color: 'bg-orange-50 text-orange-700 border-orange-200', icon: Clock, label: 'Pending Approval' },
            completed: { color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2, label: 'Completed' },
            on_hold: { color: 'bg-red-50 text-red-700 border-red-200', icon: Ban, label: 'On Hold' },
        };
        return configs[status] || { color: 'bg-neutral-100 text-neutral-700 border-neutral-200', icon: AlertCircle, label: status.replace(/_/g, ' ') };
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <StaffOnly>
            <AdminLayout>
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
                    <p className="mt-2 text-neutral-600">Welcome back! Here's what's happening today.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            <StatCard
                                title="New Orders"
                                value={stats.newOrders.count}
                                subtitle={formatCurrency(stats.newOrders.amount)}
                                icon={ShoppingCart}
                                gradient="from-blue-500 to-blue-600"
                                trend={{
                                    value: 12,
                                    label: 'vs last week',
                                    direction: 'up'
                                }}
                            />

                            <StatCard
                                title="Payment Received"
                                value={stats.paymentReceived.count}
                                subtitle="Needs processing"
                                icon={DollarSign}
                                gradient="from-emerald-500 to-emerald-600"
                                trend={{
                                    value: 8,
                                    label: 'vs last week',
                                    direction: 'up'
                                }}
                            />

                            <StatCard
                                title="In Progress"
                                value={stats.inProgress.count}
                                subtitle="Active cases"
                                icon={Clock}
                                gradient="from-amber-500 to-amber-600"
                            />

                            <StatCard
                                title="Completed (Month)"
                                value={stats.completedThisMonth.count}
                                subtitle={formatCurrency(stats.completedThisMonth.revenue)}
                                icon={CheckCircle2}
                                gradient="from-green-500 to-green-600"
                                trend={{
                                    value: 15,
                                    label: 'vs last month',
                                    direction: 'up'
                                }}
                            />

                            <StatCard
                                title="Pending Docs"
                                value={stats.pendingDocuments.count}
                                subtitle="Need review"
                                icon={FileText}
                                gradient="from-purple-500 to-purple-600"
                            />
                        </div>

                        {/* Recent Orders Table */}
                        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                            {/* Table Header */}
                            <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-semibold text-neutral-900">Recent Orders</h3>
                                    <p className="text-xs text-neutral-500 mt-0.5">Latest customer orders and their status</p>
                                </div>
                                <Link
                                    href="/admin/cases"
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
                                >
                                    View all
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-neutral-200">
                                    <thead className="bg-neutral-50/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                                Order ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                                Amount
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                                Payment
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-neutral-100">
                                        {recentOrders.map((order) => {
                                            const statusConfig = getStatusConfig(order.status);
                                            const StatusIcon = statusConfig.icon;
                                            const paymentConfig = getPaymentStatusConfig(order.paymentStatus);
                                            const PaymentIcon = paymentConfig.icon;

                                            return (
                                                <tr
                                                    key={order.$id}
                                                    className="hover:bg-neutral-50 transition-colors group"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-brand-600">
                                                            #{order.orderNumber}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-neutral-900">
                                                            {format(new Date(order.$createdAt), 'MMM dd, yyyy')}
                                                        </div>
                                                        <div className="text-xs text-neutral-500">
                                                            {format(new Date(order.$createdAt), 'hh:mm a')}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-semibold text-neutral-900">
                                                            {formatCurrency(order.amount || 0)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={cn(
                                                            "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border",
                                                            statusConfig.color
                                                        )}>
                                                            <StatusIcon className="w-3.5 h-3.5" />
                                                            {statusConfig.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={cn(
                                                            "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border capitalize",
                                                            paymentConfig.color
                                                        )}>
                                                            <PaymentIcon className="w-3.5 h-3.5" />
                                                            {order.paymentStatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <Link
                                                            href={`/admin/cases/${order.$id}`}
                                                            className="text-brand-600 hover:text-brand-700 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            View →
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </AdminLayout>
        </StaffOnly>
    );
}

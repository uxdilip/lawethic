'use client';

import { useEffect, useState } from 'react';
import { databases } from '@lawethic/appwrite/client';
import { appwriteConfig } from '@lawethic/appwrite/config';
import { Query } from 'appwrite';
import AdminLayout from '@/components/AdminLayout';
import { StaffOnly } from '@/components/RoleGuard';
import Link from 'next/link';

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

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Get all orders
            const ordersResponse = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                [Query.orderDesc('$createdAt'), Query.limit(100)]
            );

            const orders = ordersResponse.documents;

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

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            new: 'bg-blue-100 text-blue-800',
            pending_docs: 'bg-yellow-100 text-yellow-800',
            in_review: 'bg-purple-100 text-purple-800',
            ready_for_filing: 'bg-indigo-100 text-indigo-800',
            submitted: 'bg-cyan-100 text-cyan-800',
            pending_approval: 'bg-orange-100 text-orange-800',
            completed: 'bg-green-100 text-green-800',
            on_hold: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="mt-2 text-gray-600">Overview of all operations</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
                                {/* New Orders */}
                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="text-3xl">🆕</div>
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                                        New Orders
                                                    </dt>
                                                    <dd className="flex items-baseline">
                                                        <div className="text-2xl font-semibold text-gray-900">
                                                            {stats.newOrders.count}
                                                        </div>
                                                    </dd>
                                                    <dd className="text-sm text-gray-500">
                                                        {formatCurrency(stats.newOrders.amount)}
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Received */}
                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="text-3xl">💰</div>
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                                        Payment Received
                                                    </dt>
                                                    <dd className="flex items-baseline">
                                                        <div className="text-2xl font-semibold text-gray-900">
                                                            {stats.paymentReceived.count}
                                                        </div>
                                                    </dd>
                                                    <dd className="text-sm text-gray-500">
                                                        Needs processing
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* In Progress */}
                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="text-3xl">⚙️</div>
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                                        In Progress
                                                    </dt>
                                                    <dd className="flex items-baseline">
                                                        <div className="text-2xl font-semibold text-gray-900">
                                                            {stats.inProgress.count}
                                                        </div>
                                                    </dd>
                                                    <dd className="text-sm text-gray-500">
                                                        Active cases
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Completed This Month */}
                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="text-3xl">✅</div>
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                                        Completed (Month)
                                                    </dt>
                                                    <dd className="flex items-baseline">
                                                        <div className="text-2xl font-semibold text-gray-900">
                                                            {stats.completedThisMonth.count}
                                                        </div>
                                                    </dd>
                                                    <dd className="text-sm text-gray-500">
                                                        {formatCurrency(stats.completedThisMonth.revenue)}
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Pending Documents */}
                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="text-3xl">📄</div>
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                                        Pending Docs
                                                    </dt>
                                                    <dd className="flex items-baseline">
                                                        <div className="text-2xl font-semibold text-gray-900">
                                                            {stats.pendingDocuments.count}
                                                        </div>
                                                    </dd>
                                                    <dd className="text-sm text-gray-500">
                                                        Need review
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Orders */}
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Recent Orders
                                        </h3>
                                        <Link
                                            href="/admin/cases"
                                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                        >
                                            View all →
                                        </Link>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Order ID
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Amount
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Payment
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {recentOrders.map((order) => (
                                                <tr key={order.$id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        #{order.orderNumber}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(order.$createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatCurrency(order.amount || 0)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                            {order.status.replace(/_/g, ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.paymentStatus === 'paid'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {order.paymentStatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <Link
                                                            href={`/admin/cases/${order.$id}`}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            View
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </AdminLayout>
        </StaffOnly>
    );
}

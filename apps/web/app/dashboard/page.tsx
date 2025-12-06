'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { account, databases, appwriteConfig } from '@lawethic/appwrite';
import { LogOut, FileText, Bell, User as UserIcon, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Query } from 'appwrite';

interface Order {
    $id: string;
    $createdAt: string;
    orderNumber: string;
    serviceId: string;
    status: string;
    paymentStatus: string;
    amount: number;
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        inProgress: 0,
        completed: 0,
        pending: 0,
    });

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const userData = await account.get();
            setUser(userData);
            await fetchOrders(userData.$id);
        } catch (error) {
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async (userId: string) => {
        try {
            const response = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                [
                    Query.equal('customerId', userId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(10)
                ]
            );

            const ordersList = response.documents as unknown as Order[];
            setOrders(ordersList);

            // Calculate stats
            const total = ordersList.length;
            const inProgress = ordersList.filter(o => o.status === 'new' || o.status === 'processing').length;
            const completed = ordersList.filter(o => o.status === 'completed').length;
            const pending = ordersList.filter(o => o.paymentStatus === 'pending').length;

            setStats({ total, inProgress, completed, pending });
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'text-green-600 bg-green-50';
            case 'processing':
            case 'paid':
                return 'text-blue-600 bg-blue-50';
            case 'new':
                return 'text-yellow-600 bg-yellow-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4" />;
            case 'processing':
            case 'paid':
                return <Clock className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    const handleLogout = async () => {
        try {
            await account.deleteSession('current');
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold text-blue-600">
                        LawEthic
                    </Link>
                    <div className="flex items-center space-x-4">
                        <button className="p-2 hover:bg-gray-100 rounded-full relative">
                            <Bell className="h-5 w-5 text-gray-600" />
                            {stats.pending > 0 && (
                                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                            )}
                        </button>
                        <div className="flex items-center space-x-2">
                            <UserIcon className="h-5 w-5 text-gray-600" />
                            <span className="text-sm text-gray-700">{user?.name}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
                    <p className="text-gray-600 mt-2">Manage your compliance services and track order status</p>
                </div>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <FileText className="h-10 w-10 text-blue-600 opacity-20" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">In Progress</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
                            </div>
                            <FileText className="h-10 w-10 text-yellow-600 opacity-20" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                            </div>
                            <FileText className="h-10 w-10 text-green-600 opacity-20" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pending Action</p>
                                <p className="text-2xl font-bold text-red-600">{stats.pending}</p>
                            </div>
                            <FileText className="h-10 w-10 text-red-600 opacity-20" />
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold">Recent Orders</h2>
                    </div>
                    <div className="p-6">
                        {orders.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600 mb-4">No orders yet</p>
                                <Link
                                    href="/services"
                                    className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Browse Services
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Order Number
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Amount
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Payment
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {orders.map((order) => (
                                            <tr key={order.$id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {order.orderNumber}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {new Date(order.$createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        ₹{order.amount.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${order.paymentStatus === 'success'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {order.paymentStatus}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                        {getStatusIcon(order.status)}
                                                        <span className="ml-1 capitalize">{order.status}</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <Link
                                                        href={`/orders/${order.$id}`}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        View Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

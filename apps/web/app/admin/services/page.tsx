'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    FileText,
    Edit,
    Eye,
    MoreVertical,
    Search,
    Filter,
    CheckCircle,
    Clock,
    AlertCircle,
    Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface ServiceItem {
    slug: string;
    title: string;
    category: string;
    basePrice: number;
    hasContent: boolean;
    contentStatus: 'draft' | 'published' | null;
    contentVersion: number;
    lastEditedAt: string | null;
    publishedAt: string | null;
}

export default function AdminServicesPage() {
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await fetch('/api/admin/services');
            const data = await res.json();
            if (data.success) {
                setServices(data.services);
            }
        } catch (error) {
            console.error('Failed to fetch services:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get unique categories
    const categories = [...new Set(services.map(s => s.category))];

    // Filter services
    const filteredServices = services.filter(service => {
        const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.slug.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;

        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'published' && service.contentStatus === 'published') ||
            (statusFilter === 'draft' && service.contentStatus === 'draft') ||
            (statusFilter === 'none' && !service.hasContent);

        return matchesSearch && matchesCategory && matchesStatus;
    });

    const getStatusBadge = (service: ServiceItem) => {
        if (!service.hasContent) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-neutral-100 text-neutral-600">
                    <AlertCircle className="h-3 w-3" />
                    No content
                </span>
            );
        }
        if (service.contentStatus === 'published') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3" />
                    Published
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                <Clock className="h-3 w-3" />
                Draft
            </span>
        );
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-neutral-200 rounded w-48"></div>
                    <div className="h-12 bg-neutral-200 rounded"></div>
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-neutral-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Service Content</h1>
                    <p className="text-neutral-600 mt-1">
                        Manage service descriptions, pricing, and FAQs
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                        placeholder="Search services..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="none">No Content</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border rounded-lg p-4">
                    <div className="text-2xl font-bold text-neutral-900">{services.length}</div>
                    <div className="text-sm text-neutral-500">Total Services</div>
                </div>
                <div className="bg-white border rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">
                        {services.filter(s => s.contentStatus === 'published').length}
                    </div>
                    <div className="text-sm text-neutral-500">Published</div>
                </div>
                <div className="bg-white border rounded-lg p-4">
                    <div className="text-2xl font-bold text-amber-600">
                        {services.filter(s => s.contentStatus === 'draft').length}
                    </div>
                    <div className="text-sm text-neutral-500">Drafts</div>
                </div>
                <div className="bg-white border rounded-lg p-4">
                    <div className="text-2xl font-bold text-neutral-400">
                        {services.filter(s => !s.hasContent).length}
                    </div>
                    <div className="text-sm text-neutral-500">No Content</div>
                </div>
            </div>

            {/* Service List */}
            <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-neutral-50 border-b">
                        <tr>
                            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                                Service
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden md:table-cell">
                                Category
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden sm:table-cell">
                                Status
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden lg:table-cell">
                                Last Edited
                            </th>
                            <th className="text-right px-4 py-3 text-sm font-medium text-neutral-600">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredServices.map(service => (
                            <tr key={service.slug} className="hover:bg-neutral-50">
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-brand-100 flex items-center justify-center">
                                            <FileText className="h-5 w-5 text-brand-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-neutral-900">
                                                {service.title}
                                            </div>
                                            <div className="text-sm text-neutral-500">
                                                /{service.slug}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4 hidden md:table-cell">
                                    <span className="text-sm text-neutral-600">
                                        {service.category}
                                    </span>
                                </td>
                                <td className="px-4 py-4 hidden sm:table-cell">
                                    {getStatusBadge(service)}
                                </td>
                                <td className="px-4 py-4 hidden lg:table-cell">
                                    <span className="text-sm text-neutral-500">
                                        {formatDate(service.lastEditedAt)}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link href={`/admin/services/${service.slug}/edit`}>
                                            <Button variant="outline" size="sm">
                                                <Edit className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                        </Link>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/services/${service.slug}`} target="_blank">
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Live
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/services/${service.slug}/history`}>
                                                        <Clock className="h-4 w-4 mr-2" />
                                                        Version History
                                                    </Link>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredServices.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-neutral-900 mb-1">
                            No services found
                        </h3>
                        <p className="text-neutral-500">
                            Try adjusting your search or filters
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

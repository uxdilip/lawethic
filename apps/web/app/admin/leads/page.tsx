'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { StaffOnly } from '@/components/RoleGuard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, Phone, Mail, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Lead {
    $id: string;
    $createdAt: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    service: string;
    category: string;
    package: string;
    status: 'new' | 'contacted' | 'converted' | 'rejected';
}

export default function AdminLeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const { toast } = useToast();

    useEffect(() => {
        loadLeads();
    }, []);

    useEffect(() => {
        filterLeads();
    }, [leads, searchTerm, statusFilter]);

    const loadLeads = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/leads');
            if (!response.ok) {
                throw new Error('Failed to fetch leads');
            }
            const data = await response.json();
            setLeads(data.documents as unknown as Lead[]);
        } catch (error) {
            console.error('Error loading leads:', error);
            toast({
                title: 'Error',
                description: 'Failed to load leads',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const filterLeads = () => {
        let filtered = [...leads];

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter((lead) => lead.status === statusFilter);
        }

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (lead) =>
                    lead.name.toLowerCase().includes(term) ||
                    lead.email.toLowerCase().includes(term) ||
                    lead.phone.includes(term) ||
                    lead.service.toLowerCase().includes(term)
            );
        }

        setFilteredLeads(filtered);
    };

    const updateLeadStatus = async (leadId: string, newStatus: Lead['status']) => {
        try {
            const response = await fetch(`/api/leads/${leadId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update lead');
            }

            setLeads((prevLeads) =>
                prevLeads.map((lead) =>
                    lead.$id === leadId ? { ...lead, status: newStatus } : lead
                )
            );

            toast({
                title: 'Success',
                description: 'Lead status updated',
            });
        } catch (error) {
            console.error('Error updating lead:', error);
            toast({
                title: 'Error',
                description: 'Failed to update lead status',
                variant: 'destructive',
            });
        }
    };

    const getStatusBadge = (status: Lead['status']) => {
        const variants: Record<Lead['status'], { color: string; label: string }> = {
            new: { color: 'bg-blue-500', label: 'New' },
            contacted: { color: 'bg-yellow-500', label: 'Contacted' },
            converted: { color: 'bg-green-500', label: 'Converted' },
            rejected: { color: 'bg-red-500', label: 'Rejected' },
        };

        const { color, label } = variants[status];
        return (
            <Badge className={`${color} text-white`}>
                {label}
            </Badge>
        );
    };

    const stats = {
        total: leads.length,
        new: leads.filter((l) => l.status === 'new').length,
        contacted: leads.filter((l) => l.status === 'contacted').length,
        converted: leads.filter((l) => l.status === 'converted').length,
    };

    return (
        <StaffOnly>
            <AdminLayout>
                <div className="p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold mb-2">Leads Management</h1>
                        <p className="text-gray-600">Manage and track customer leads</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <p className="text-gray-600 text-sm">Total Leads</p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg shadow">
                            <p className="text-gray-600 text-sm">New Leads</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg shadow">
                            <p className="text-gray-600 text-sm">Contacted</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.contacted}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg shadow">
                            <p className="text-gray-600 text-sm">Converted</p>
                            <p className="text-2xl font-bold text-green-600">{stats.converted}</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-4 rounded-lg shadow mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    placeholder="Search by name, email, phone, or service..."
                                    value={searchTerm}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-48">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="contacted">Contacted</SelectItem>
                                    <SelectItem value="converted">Converted</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Leads Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center">
                                <p className="text-gray-500">Loading leads...</p>
                            </div>
                        ) : filteredLeads.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-gray-500">No leads found</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Service</TableHead>
                                        <TableHead>Package</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLeads.map((lead) => (
                                        <TableRow key={lead.$id}>
                                            <TableCell className="text-sm">
                                                {new Date(lead.$createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="font-medium">{lead.name}</TableCell>
                                            <TableCell>
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-4 h-4 text-gray-400" />
                                                        <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                                                            {lead.phone}
                                                        </a>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-4 h-4 text-gray-400" />
                                                        <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                                                            {lead.email}
                                                        </a>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    {lead.city}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div className="font-medium">{lead.service}</div>
                                                    <div className="text-gray-500">{lead.category}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{lead.package}</Badge>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(lead.status)}</TableCell>
                                            <TableCell>
                                                <Select
                                                    value={lead.status}
                                                    onValueChange={(value) =>
                                                        updateLeadStatus(lead.$id, value as Lead['status'])
                                                    }
                                                >
                                                    <SelectTrigger className="w-32">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="new">New</SelectItem>
                                                        <SelectItem value="contacted">Contacted</SelectItem>
                                                        <SelectItem value="converted">Converted</SelectItem>
                                                        <SelectItem value="rejected">Rejected</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </div>
            </AdminLayout>
        </StaffOnly>
    );
}

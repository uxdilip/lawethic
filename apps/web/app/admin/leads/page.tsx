'use client';

import { useEffect, useState } from 'react';


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
import { Search, Phone, Mail, MapPin, Users } from 'lucide-react';
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
        <>
            
                <div className="p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold mb-2">Leads Management</h1>
                        <p className="text-gray-600">Manage and track customer leads</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-lg bg-gradient-to-br from-neutral-500 to-neutral-600">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-neutral-600">Total Leads</p>
                                <p className="text-3xl font-bold text-neutral-900">{stats.total}</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-neutral-600">New Leads</p>
                                <p className="text-3xl font-bold text-neutral-900">{stats.new}</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-neutral-600">Contacted</p>
                                <p className="text-3xl font-bold text-neutral-900">{stats.contacted}</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-neutral-600">Converted</p>
                                <p className="text-3xl font-bold text-neutral-900">{stats.converted}</p>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden mb-6">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
                            <h3 className="text-base font-semibold text-neutral-900">Search & Filter</h3>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search by name, email, phone, or service..."
                                        value={searchTerm}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                        className="pl-10 border-neutral-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full md:w-48 border-neutral-200">
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
                    </div>

                    {/* Leads Table */}
                    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
                                <p className="text-neutral-600">Loading leads...</p>
                            </div>
                        ) : filteredLeads.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                                    <Users className="w-6 h-6 text-neutral-400" />
                                </div>
                                <p className="text-neutral-600 font-medium">No leads found</p>
                                <p className="text-xs text-neutral-500 mt-1">Try adjusting your search or filters</p>
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
            
        </>
    );
}

'use client';

import { useState, useMemo } from 'react';
import { SERVICES } from '@/data/services';
import { CATEGORIES } from '@/data/categories';
import ServiceCard from '@/components/customer/ServiceCard';
import ServiceDrawer from '@/components/customer/ServiceDrawer';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// Category tabs configuration
const CATEGORY_TABS = [
    { id: 'all', label: 'All Services' },
    { id: 'company-registration', label: 'Company Registration' },
    { id: 'gst-registration', label: 'Taxation & GST' },
    { id: 'trademark-registration', label: 'Trademark & IP' },
    { id: 'licenses-registrations', label: 'Licenses & Registrations' },
];

export default function ServiceHubPage() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedService, setSelectedService] = useState<typeof SERVICES[0] | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Filter services based on category and search
    const filteredServices = useMemo(() => {
        return SERVICES.filter(service => {
            // Category filter
            const categoryMatch = activeCategory === 'all' || service.categorySlug === activeCategory;

            // Search filter
            const searchMatch = !searchQuery ||
                service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                service.shortTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                service.category.toLowerCase().includes(searchQuery.toLowerCase());

            return categoryMatch && searchMatch;
        });
    }, [activeCategory, searchQuery]);

    // Group services by category for "All" view
    const groupedServices = useMemo(() => {
        if (activeCategory !== 'all') {
            return { [activeCategory]: filteredServices };
        }

        const groups: Record<string, typeof SERVICES> = {};
        filteredServices.forEach(service => {
            if (!groups[service.categorySlug]) {
                groups[service.categorySlug] = [];
            }
            groups[service.categorySlug].push(service);
        });
        return groups;
    }, [filteredServices, activeCategory]);

    const handleViewDetails = (service: typeof SERVICES[0]) => {
        setSelectedService(service);
        setDrawerOpen(true);
    };

    const getCategoryLabel = (slug: string) => {
        const tab = CATEGORY_TABS.find(t => t.id === slug);
        if (tab) return tab.label;
        return CATEGORIES[slug]?.title || slug;
    };

    return (
        <div className="p-6">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Service Hub</h1>
                <p className="text-gray-600 mt-1">Browse our compliance services and start your registration journey</p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search services..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    />
                </div>
            </div>

            {/* Category Tabs */}
            <div className="mb-8 border-b border-gray-200">
                <nav className="flex gap-1 -mb-px overflow-x-auto pb-px">
                    {CATEGORY_TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveCategory(tab.id)}
                            className={cn(
                                "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                                activeCategory === tab.id
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Services Grid */}
            {filteredServices.length === 0 ? (
                <div className="text-center py-16">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
                    <p className="text-gray-500">
                        Try adjusting your search or browse a different category
                    </p>
                </div>
            ) : activeCategory === 'all' ? (
                // Grouped view for "All"
                <div className="space-y-10">
                    {Object.entries(groupedServices).map(([categorySlug, services]) => (
                        <div key={categorySlug}>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                {getCategoryLabel(categorySlug)}
                            </h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {services.map(service => (
                                    <ServiceCard
                                        key={service.slug}
                                        service={service}
                                        onViewDetails={() => handleViewDetails(service)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // Flat grid for specific category
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredServices.map(service => (
                        <ServiceCard
                            key={service.slug}
                            service={service}
                            onViewDetails={() => handleViewDetails(service)}
                        />
                    ))}
                </div>
            )}

            {/* Service Details Drawer */}
            <ServiceDrawer
                service={selectedService}
                open={drawerOpen}
                onClose={() => {
                    setDrawerOpen(false);
                    setSelectedService(null);
                }}
            />
        </div>
    );
}

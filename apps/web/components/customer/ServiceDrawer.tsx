'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Service } from '@/data/services';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Clock,
    CheckCircle2,
    FileText,
    Phone,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ServiceDrawerProps {
    service: Service | null;
    open: boolean;
    onClose: () => void;
}

type Tab = 'overview' | 'process';

export default function ServiceDrawer({ service, open, onClose }: ServiceDrawerProps) {
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    if (!service) return null;

    const tabs: { id: Tab; label: string }[] = [
        { id: 'overview', label: 'Overview' },
        { id: 'process', label: 'Process & Documents' },
    ];

    return (
        <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
                {/* Header */}
                <div className="border-b border-gray-200">
                    <SheetHeader className="p-6 pb-4">
                        <SheetTitle className="text-lg font-semibold text-gray-900 leading-snug pr-8">
                            {service.title}
                        </SheetTitle>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-xl font-bold text-gray-900">
                                ₹{service.basePrice.toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {service.timeline}
                            </span>
                        </div>
                    </SheetHeader>

                    {/* Tabs */}
                    <div className="flex gap-1 px-6">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                                    activeTab === tab.id
                                        ? "border-blue-600 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'overview' ? (
                        <OverviewTab service={service} />
                    ) : (
                        <ProcessTab service={service} />
                    )}
                </div>

                {/* Footer CTAs */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                                // TODO: Open callback form
                            }}
                        >
                            <Phone className="w-4 h-4 mr-2" />
                            Request Callback
                        </Button>
                        <Button
                            asChild
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            <Link href={`/onboarding?service=${service.slug}&skipLead=true`}>
                                Avail Service
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

// Overview Tab Content
function OverviewTab({ service }: { service: Service }) {
    return (
        <div className="space-y-6">
            {/* Benefits Section */}
            {service.benefits && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                        Key Benefits
                    </h3>
                    <ul className="space-y-2.5">
                        {service.benefits.items.slice(0, 6).map((benefit, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{benefit.title}</p>
                                    {benefit.description && (
                                        <p className="text-sm text-gray-500 mt-0.5">{benefit.description}</p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Overview Description */}
            {service.overview && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                        About This Service
                    </h3>
                    <div
                        className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: service.overview.description }}
                    />
                </div>
            )}

            {/* Eligibility */}
            {service.eligibility && service.eligibility.entities && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                        Who Can Apply
                    </h3>
                    <ul className="space-y-2">
                        {service.eligibility.entities.map((entity, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-600">
                                <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                <span>{entity.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Hero Highlights */}
            {service.hero.highlights && service.hero.highlights.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                        What's Included
                    </h3>
                    <ul className="space-y-2">
                        {service.hero.highlights.map((highlight, idx) => (
                            <li key={idx} className="flex items-center gap-2.5 text-sm text-gray-600">
                                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span>{highlight}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

// Process & Documents Tab Content
function ProcessTab({ service }: { service: Service }) {
    return (
        <div className="space-y-6">
            {/* Process Steps */}
            {service.process && service.process.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                        Registration Process
                    </h3>
                    <div className="space-y-4">
                        {service.process.map((step, idx) => (
                            <div key={idx} className="flex gap-3">
                                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                                    {step.step}
                                </div>
                                <div className="flex-1 pt-0.5">
                                    <p className="text-sm font-medium text-gray-900">{step.title}</p>
                                    <p className="text-sm text-gray-500 mt-0.5">{step.description}</p>
                                    {step.duration && (
                                        <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {step.duration}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Required Documents */}
            {service.documents && service.documents.groups && service.documents.groups.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                        Required Documents
                    </h3>
                    <div className="space-y-4">
                        {service.documents.groups.map((group, groupIdx) => (
                            <div key={groupIdx} className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">
                                    {group.entityType}
                                </h4>
                                <ul className="space-y-1.5">
                                    {group.items.map((doc, docIdx) => (
                                        <li key={docIdx} className="flex items-center gap-2 text-sm text-gray-600">
                                            <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                            <span>{doc}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Fees if available */}
            {service.fees && service.fees.description && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                        Fee Structure
                    </h3>
                    <div
                        className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: service.fees.description }}
                    />
                </div>
            )}
        </div>
    );
}

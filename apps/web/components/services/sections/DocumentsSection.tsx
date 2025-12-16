'use client'

import { useState } from 'react'
import { DocumentsSection as DocsType } from '@/data/services'
import { FileText, Check, ChevronDown, ChevronUp } from 'lucide-react'

interface DocumentsSectionProps {
    data: DocsType
}

export function DocumentsSection({ data }: DocumentsSectionProps) {
    const [activeTab, setActiveTab] = useState(0)
    const [expandedGroups, setExpandedGroups] = useState<number[]>([0])

    // Safety check - return null if no groups
    if (!data.groups || data.groups.length === 0) {
        return null
    }

    const toggleGroup = (index: number) => {
        setExpandedGroups(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        )
    }

    return (
        <section id="documents" className="scroll-mt-28">
            <h2 className="text-2xl font-bold text-neutral-900 mb-3">{data.title}</h2>

            {data.description && (
                <p className="text-neutral-600 mb-6">{data.description}</p>
            )}

            {/* Entity Tabs */}
            {data.groups.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {data.groups.map((group, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveTab(i)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === i
                                ? 'bg-brand-600 text-white'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                }`}
                        >
                            {group.entityType}
                        </button>
                    ))}
                </div>
            )}

            {/* Documents List */}
            <div className="space-y-4">
                {data.groups.length === 1 ? (
                    // Single group - show all items
                    <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
                        {data.groups[0].items.map((doc, i) => (
                            <div key={i} className="flex items-start gap-3 p-4">
                                <div className="mt-0.5 w-5 h-5 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Check className="h-3 w-3 text-brand-600" />
                                </div>
                                <p className="text-sm font-medium text-neutral-900">{doc}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Multiple groups - tabbed view
                    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                        <div className="p-4 bg-neutral-50 border-b border-neutral-200">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-brand-600" />
                                <h3 className="font-semibold text-neutral-900">
                                    Documents for {data.groups[activeTab]?.entityType}
                                </h3>
                            </div>
                        </div>
                        <div className="divide-y divide-neutral-100">
                            {data.groups[activeTab]?.items.map((doc, i) => (
                                <div key={i} className="flex items-start gap-3 p-4">
                                    <div className="mt-0.5 w-5 h-5 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Check className="h-3 w-3 text-brand-600" />
                                    </div>
                                    <p className="text-sm font-medium text-neutral-900">{doc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Alternative: Accordion view for mobile */}
            <div className="md:hidden mt-6">
                <p className="text-xs text-neutral-400 mb-3">Or view by entity type:</p>
                <div className="space-y-2">
                    {data.groups.map((group, i) => (
                        <div key={i} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                            <button
                                onClick={() => toggleGroup(i)}
                                className="w-full flex items-center justify-between p-4"
                            >
                                <span className="font-medium text-neutral-900">{group.entityType}</span>
                                {expandedGroups.includes(i) ? (
                                    <ChevronUp className="h-5 w-5 text-neutral-400" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-neutral-400" />
                                )}
                            </button>
                            {expandedGroups.includes(i) && (
                                <div className="px-4 pb-4 border-t border-neutral-100">
                                    <div className="pt-3 space-y-2">
                                        {group.items.map((doc, j) => (
                                            <div key={j} className="flex items-start gap-2 text-sm">
                                                <Check className="h-4 w-4 text-brand-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-neutral-700">{doc}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, Save, Eye, History, Loader2, Check, AlertCircle,
    FileText, Package, List, HelpCircle, ClipboardList,
    Users, Receipt, Award, Settings, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ServiceContentData } from '@lawethic/appwrite/types';
import {
    HeroSection,
    PackagesSection,
    OverviewSection,
    ProcessSection,
    FAQsSection,
    DocumentsSection,
    EligibilitySection,
    FeesSection,
    BenefitsSection,
    MetaSection,
} from '@/components/admin/service-editor';

// Section configuration
const SECTIONS = [
    { id: 'hero', label: 'Hero', icon: Sparkles },
    { id: 'packages', label: 'Packages', icon: Package },
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'process', label: 'Process', icon: List },
    { id: 'documents', label: 'Documents', icon: ClipboardList },
    { id: 'eligibility', label: 'Eligibility', icon: Users },
    { id: 'fees', label: 'Fees', icon: Receipt },
    { id: 'benefits', label: 'Benefits', icon: Award },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
] as const;

type SectionId = typeof SECTIONS[number]['id'];

interface ServiceMeta {
    title: string;
    category: string;
    basePrice: number;
    timeline: string;
    badge?: string;
}

export default function ServiceEditorPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [activeSection, setActiveSection] = useState<SectionId>('hero');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<'draft' | 'published' | 'none'>('none');
    const [version, setVersion] = useState(1);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Content state
    const [content, setContent] = useState<ServiceContentData | null>(null);
    const [meta, setMeta] = useState<ServiceMeta>({
        title: '',
        category: '',
        basePrice: 0,
        timeline: '',
        badge: '',
    });

    // Load service content
    useEffect(() => {
        async function loadContent() {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch(`/api/admin/services/${slug}`);
                if (!res.ok) throw new Error('Failed to load service');

                const data = await res.json();

                setContent(data.content);
                setMeta({
                    title: data.title || '',
                    category: data.category || '',
                    basePrice: data.basePrice || 0,
                    timeline: data.timeline || '',
                    badge: data.badge || '',
                });
                setStatus(data.status || 'none');
                setVersion(data.version || 1);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load');
            } finally {
                setLoading(false);
            }
        }

        loadContent();
    }, [slug]);

    // Update content handler
    const updateContent = useCallback(<K extends keyof ServiceContentData>(
        key: K,
        value: ServiceContentData[K]
    ) => {
        setContent(prev => prev ? { ...prev, [key]: value } : null);
        setHasChanges(true);
    }, []);

    // Update meta handler
    const updateMeta = useCallback((field: string, value: string | number) => {
        setMeta(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    }, []);

    // Save draft
    const handleSave = async () => {
        if (!content) return;

        try {
            setSaving(true);
            setError(null);

            const res = await fetch(`/api/admin/services/${slug}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    title: meta.title,
                    category: meta.category,
                    basePrice: meta.basePrice,
                    timeline: meta.timeline,
                    badge: meta.badge,
                }),
            });

            if (!res.ok) throw new Error('Failed to save');

            const data = await res.json();
            setVersion(data.version);
            setStatus('draft');
            setHasChanges(false);
            setLastSaved(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    // Publish
    const handlePublish = async () => {
        try {
            setPublishing(true);
            setError(null);

            // Save first if there are changes
            if (hasChanges) {
                await handleSave();
            }

            const res = await fetch(`/api/admin/services/${slug}/publish`, {
                method: 'POST',
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to publish');
            }

            setStatus('published');
            setHasChanges(false);

            // Show success message if already published
            if (data.alreadyPublished) {
                console.log('Content was already published');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to publish');
        } finally {
            setPublishing(false);
        }
    };

    // Preview (open in new tab)
    const handlePreview = () => {
        window.open(`/services/${slug}`, '_blank');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
        );
    }

    if (!content) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <AlertCircle className="h-12 w-12 text-red-400" />
                <p className="text-neutral-600">Failed to load service content</p>
                <Button variant="outline" onClick={() => router.back()}>
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b">
                <div className="flex items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/services"
                            className="text-neutral-500 hover:text-neutral-700"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="font-semibold text-neutral-900">
                                {meta.title || slug}
                            </h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <Badge
                                    variant={status === 'published' ? 'default' : 'secondary'}
                                    className={cn(
                                        'text-xs',
                                        status === 'published' && 'bg-green-100 text-green-700',
                                        status === 'draft' && 'bg-amber-100 text-amber-700'
                                    )}
                                >
                                    {status === 'published' ? 'Published' : status === 'draft' ? 'Draft' : 'New'}
                                </Badge>
                                <span className="text-xs text-neutral-500">v{version}</span>
                                {lastSaved && (
                                    <span className="text-xs text-neutral-400">
                                        Saved {lastSaved.toLocaleTimeString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {error && (
                            <span className="text-sm text-red-500 mr-2">{error}</span>
                        )}

                        <Link href={`/admin/services/${slug}/history`}>
                            <Button variant="ghost" size="sm">
                                <History className="h-4 w-4 mr-2" />
                                History
                            </Button>
                        </Link>

                        <Button variant="outline" size="sm" onClick={handlePreview}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSave}
                            disabled={saving || !hasChanges}
                        >
                            {saving ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : hasChanges ? (
                                <Save className="h-4 w-4 mr-2" />
                            ) : (
                                <Check className="h-4 w-4 mr-2" />
                            )}
                            {saving ? 'Saving...' : hasChanges ? 'Save Draft' : 'Saved'}
                        </Button>

                        <Button
                            size="sm"
                            onClick={handlePublish}
                            disabled={publishing}
                            className="bg-brand-600 hover:bg-brand-700"
                        >
                            {publishing ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : null}
                            {publishing ? 'Publishing...' : 'Publish'}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex">
                {/* Sidebar Navigation */}
                <aside className="w-56 flex-shrink-0 bg-white border-r min-h-[calc(100vh-57px)] sticky top-[57px]">
                    <nav className="p-4">
                        <ul className="space-y-1">
                            {SECTIONS.map((section) => {
                                const Icon = section.icon;
                                return (
                                    <li key={section.id}>
                                        <button
                                            onClick={() => setActiveSection(section.id)}
                                            className={cn(
                                                'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                                                activeSection === section.id
                                                    ? 'bg-brand-50 text-brand-700'
                                                    : 'text-neutral-600 hover:bg-neutral-100'
                                            )}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {section.label}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </aside>

                {/* Editor Content */}
                <main className="flex-1 p-8 max-w-4xl">
                    <div className="bg-white rounded-lg border p-6">
                        {/* Render active section */}
                        {activeSection === 'hero' && (
                            <HeroSection
                                content={content.hero}
                                onChange={(hero) => updateContent('hero', hero)}
                            />
                        )}

                        {activeSection === 'packages' && (
                            <PackagesSection
                                packages={content.packages}
                                onChange={(packages) => updateContent('packages', packages)}
                            />
                        )}

                        {activeSection === 'overview' && (
                            <OverviewSection
                                content={content.overview}
                                onChange={(overview) => updateContent('overview', overview)}
                            />
                        )}

                        {activeSection === 'process' && (
                            <ProcessSection
                                steps={content.process}
                                onChange={(process) => updateContent('process', process)}
                            />
                        )}

                        {activeSection === 'documents' && (
                            <DocumentsSection
                                content={content.documents}
                                onChange={(documents) => updateContent('documents', documents)}
                            />
                        )}

                        {activeSection === 'eligibility' && (
                            <EligibilitySection
                                content={content.eligibility}
                                onChange={(eligibility) => updateContent('eligibility', eligibility)}
                            />
                        )}

                        {activeSection === 'fees' && (
                            <FeesSection
                                content={content.fees}
                                onChange={(fees) => updateContent('fees', fees)}
                            />
                        )}

                        {activeSection === 'benefits' && (
                            <BenefitsSection
                                content={content.benefits}
                                onChange={(benefits) => updateContent('benefits', benefits)}
                            />
                        )}

                        {activeSection === 'faqs' && (
                            <FAQsSection
                                faqs={content.faqs}
                                onChange={(faqs) => updateContent('faqs', faqs)}
                            />
                        )}

                        {activeSection === 'settings' && (
                            <MetaSection
                                content={content.meta}
                                onChange={(metaContent) => updateContent('meta', metaContent)}
                                title={meta.title}
                                category={meta.category}
                                basePrice={meta.basePrice}
                                timeline={meta.timeline}
                                badge={meta.badge}
                                onBasicChange={updateMeta}
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrayField } from '../ArrayField';
import { MetaContent } from '@lawethic/appwrite/types';

interface MetaSectionProps {
    content: MetaContent;
    onChange: (content: MetaContent) => void;
    // Basic info fields
    title: string;
    category: string;
    basePrice: number;
    timeline: string;
    badge?: string;
    onBasicChange: (field: string, value: string | number) => void;
}

export function MetaSection({
    content,
    onChange,
    title,
    category,
    basePrice,
    timeline,
    badge,
    onBasicChange
}: MetaSectionProps) {
    const updateField = <K extends keyof MetaContent>(field: K, value: MetaContent[K]) => {
        onChange({ ...content, [field]: value });
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">General Settings</h3>
                <p className="text-sm text-neutral-500 mb-6">
                    Basic service information and SEO settings.
                </p>
            </div>

            {/* Basic Info */}
            <div className="border-b pb-6">
                <h4 className="text-sm font-medium text-neutral-900 mb-4">Basic Information</h4>
                <div className="grid gap-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="service-title">Service Title *</Label>
                            <Input
                                id="service-title"
                                value={title}
                                onChange={(e) => onBasicChange('title', e.target.value)}
                                placeholder="e.g., Trademark Registration"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="service-category">Category *</Label>
                            <Input
                                id="service-category"
                                value={category}
                                onChange={(e) => onBasicChange('category', e.target.value)}
                                placeholder="e.g., Trademark & IP"
                            />
                        </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="base-price">Base Price (₹) *</Label>
                            <Input
                                id="base-price"
                                type="number"
                                value={basePrice}
                                onChange={(e) => onBasicChange('basePrice', parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="timeline">Timeline</Label>
                            <Input
                                id="timeline"
                                value={timeline}
                                onChange={(e) => onBasicChange('timeline', e.target.value)}
                                placeholder="e.g., 1-2 days filing"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="badge">Badge (Optional)</Label>
                            <Input
                                id="badge"
                                value={badge || ''}
                                onChange={(e) => onBasicChange('badge', e.target.value)}
                                placeholder="e.g., Most Popular"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* SEO Settings */}
            <div>
                <h4 className="text-sm font-medium text-neutral-900 mb-4">SEO Settings</h4>
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="meta-title">Meta Title</Label>
                        <Input
                            id="meta-title"
                            value={content.title}
                            onChange={(e) => updateField('title', e.target.value)}
                            placeholder="SEO title for search engines..."
                        />
                        <p className="text-xs text-neutral-500">
                            {content.title.length}/60 characters (recommended)
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="meta-description">Meta Description</Label>
                        <Textarea
                            id="meta-description"
                            value={content.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            placeholder="SEO description for search engines..."
                            rows={3}
                        />
                        <p className="text-xs text-neutral-500">
                            {content.description.length}/160 characters (recommended)
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label>Keywords</Label>
                        <ArrayField
                            items={content.keywords}
                            onChange={(items) => updateField('keywords', items)}
                            placeholder="e.g., trademark registration"
                            addButtonText="Add Keyword"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MetaSection;

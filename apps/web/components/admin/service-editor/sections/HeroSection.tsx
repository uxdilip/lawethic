'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrayField } from '../ArrayField';
import { HeroContent } from '@lawethic/appwrite/types';

interface HeroSectionProps {
    content: HeroContent;
    onChange: (content: HeroContent) => void;
}

export function HeroSection({ content, onChange }: HeroSectionProps) {
    const updateField = <K extends keyof HeroContent>(field: K, value: HeroContent[K]) => {
        onChange({ ...content, [field]: value });
    };

    const updateTrustSignal = (field: string, value: string) => {
        onChange({
            ...content,
            trustSignals: {
                ...content.trustSignals,
                [field]: value,
            },
        });
    };

    const updateStat = (field: string, value: string) => {
        onChange({
            ...content,
            stats: {
                ...content.stats,
                [field]: value,
            },
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Hero Section</h3>
                <p className="text-sm text-neutral-500 mb-6">
                    The main banner shown at the top of the service page.
                </p>
            </div>

            <div className="grid gap-6">
                {/* Badge */}
                <div className="space-y-2">
                    <Label htmlFor="hero-badge">Badge Text</Label>
                    <Input
                        id="hero-badge"
                        value={content.badge || ''}
                        onChange={(e) => updateField('badge', e.target.value)}
                        placeholder="e.g., Most Popular, Limited Offer"
                    />
                    <p className="text-xs text-neutral-500">
                        Small badge shown above the title (optional)
                    </p>
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <Label htmlFor="hero-title">Title *</Label>
                    <Input
                        id="hero-title"
                        value={content.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        placeholder="e.g., Trademark Registration Online in India"
                    />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label htmlFor="hero-description">Description *</Label>
                    <Textarea
                        id="hero-description"
                        value={content.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        placeholder="Brief description of the service..."
                        rows={3}
                    />
                </div>

                {/* Highlights */}
                <div className="space-y-2">
                    <Label>Key Highlights</Label>
                    <ArrayField
                        items={content.highlights}
                        onChange={(items) => updateField('highlights', items)}
                        placeholder="e.g., Filing within 24 hours"
                        addButtonText="Add Highlight"
                    />
                    <p className="text-xs text-neutral-500">
                        Bullet points shown in the hero section
                    </p>
                </div>

                {/* Form Settings */}
                <div className="border-t pt-6 mt-2">
                    <h4 className="text-sm font-medium text-neutral-900 mb-4">Lead Capture Form</h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="form-title">Form Title</Label>
                            <Input
                                id="form-title"
                                value={content.formTitle || ''}
                                onChange={(e) => updateField('formTitle', e.target.value)}
                                placeholder="e.g., Get Started Today!"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="form-cta">Button Text</Label>
                            <Input
                                id="form-cta"
                                value={content.formCta || ''}
                                onChange={(e) => updateField('formCta', e.target.value)}
                                placeholder="e.g., Submit"
                            />
                        </div>
                    </div>
                </div>

                {/* Trust Signals */}
                <div className="border-t pt-6 mt-2">
                    <h4 className="text-sm font-medium text-neutral-900 mb-4">Trust Signals</h4>
                    <p className="text-xs text-neutral-500 mb-4">
                        These appear as badges with icons in the hero section. Leave blank to use defaults.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="trust-secure">🛡️ Secure Badge</Label>
                            <Input
                                id="trust-secure"
                                value={content.trustSignals?.secure || ''}
                                onChange={(e) => updateTrustSignal('secure', e.target.value)}
                                placeholder="Default: 100% Secure"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="trust-fast">⏱️ Speed Badge</Label>
                            <Input
                                id="trust-fast"
                                value={content.trustSignals?.fast || ''}
                                onChange={(e) => updateTrustSignal('fast', e.target.value)}
                                placeholder="Default: Quick Processing"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="trust-support">👥 Support Badge</Label>
                            <Input
                                id="trust-support"
                                value={content.trustSignals?.support || ''}
                                onChange={(e) => updateTrustSignal('support', e.target.value)}
                                placeholder="Default: Expert Support"
                            />
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="border-t pt-6 mt-2">
                    <h4 className="text-sm font-medium text-neutral-900 mb-4">Stats Section</h4>
                    <p className="text-xs text-neutral-500 mb-4">
                        Social proof stats shown below trust signals. Leave blank to use defaults.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-4">
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label htmlFor="stat-count">📊 Count Value</Label>
                                <Input
                                    id="stat-count"
                                    value={content.stats?.count || ''}
                                    onChange={(e) => updateStat('count', e.target.value)}
                                    placeholder="Default: 10,000+"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stat-count-label">Count Label</Label>
                                <Input
                                    id="stat-count-label"
                                    value={content.stats?.countLabel || ''}
                                    onChange={(e) => updateStat('countLabel', e.target.value)}
                                    placeholder="Default: Registrations Done"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label htmlFor="stat-rating">⭐ Rating Value</Label>
                                <Input
                                    id="stat-rating"
                                    value={content.stats?.rating || ''}
                                    onChange={(e) => updateStat('rating', e.target.value)}
                                    placeholder="Default: 4.8/5"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stat-rating-label">Rating Label</Label>
                                <Input
                                    id="stat-rating-label"
                                    value={content.stats?.ratingLabel || ''}
                                    onChange={(e) => updateStat('ratingLabel', e.target.value)}
                                    placeholder="Default: Rating"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label htmlFor="stat-timeline">📅 Timeline Value</Label>
                                <Input
                                    id="stat-timeline"
                                    value={content.stats?.timeline || ''}
                                    onChange={(e) => updateStat('timeline', e.target.value)}
                                    placeholder="Default: 7-10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stat-timeline-label">Timeline Label</Label>
                                <Input
                                    id="stat-timeline-label"
                                    value={content.stats?.timelineLabel || ''}
                                    onChange={(e) => updateStat('timelineLabel', e.target.value)}
                                    placeholder="Default: Working Days"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HeroSection;

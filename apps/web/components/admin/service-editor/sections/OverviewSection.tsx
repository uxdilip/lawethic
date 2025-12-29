'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '../RichTextEditor';
import { ArrayField } from '../ArrayField';
import { OverviewContent } from '@lawethic/appwrite/types';

interface OverviewSectionProps {
    content: OverviewContent | undefined;
    onChange: (content: OverviewContent) => void;
}

export function OverviewSection({ content, onChange }: OverviewSectionProps) {
    const data: OverviewContent = content || {
        title: 'Overview',
        description: '',
        highlights: [],
    };

    const updateField = <K extends keyof OverviewContent>(field: K, value: OverviewContent[K]) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Overview Section</h3>
                <p className="text-sm text-neutral-500 mb-6">
                    Detailed description of what the service is and why it matters.
                </p>
            </div>

            <div className="grid gap-6">
                {/* Title */}
                <div className="space-y-2">
                    <Label htmlFor="overview-title">Section Title</Label>
                    <Input
                        id="overview-title"
                        value={data.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        placeholder="e.g., What is Trademark Registration?"
                    />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label>Description</Label>
                    <RichTextEditor
                        content={data.description}
                        onChange={(value) => updateField('description', value)}
                        placeholder="Explain the service in detail..."
                        minHeight="300px"
                    />
                    <p className="text-xs text-neutral-500">
                        Use formatting to make the content scannable. Include key information about the service.
                    </p>
                </div>

                {/* Highlights */}
                <div className="space-y-2">
                    <Label>Key Points / Highlights</Label>
                    <ArrayField
                        items={data.highlights || []}
                        onChange={(items) => updateField('highlights', items)}
                        placeholder="e.g., Protects brand identity for 10 years"
                        addButtonText="Add Key Point"
                    />
                </div>
            </div>
        </div>
    );
}

export default OverviewSection;

'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { IconPicker } from '../IconPicker';
import { BenefitsContent, BenefitItemContent } from '@lawethic/appwrite/types';

interface BenefitsSectionProps {
    content: BenefitsContent | undefined;
    onChange: (content: BenefitsContent) => void;
}

export function BenefitsSection({ content, onChange }: BenefitsSectionProps) {
    const data: BenefitsContent = content || {
        title: 'Benefits',
        description: '',
        items: [],
    };

    const updateField = <K extends keyof BenefitsContent>(field: K, value: BenefitsContent[K]) => {
        onChange({ ...data, [field]: value });
    };

    const updateItem = (index: number, item: BenefitItemContent) => {
        const updated = [...data.items];
        updated[index] = item;
        updateField('items', updated);
    };

    const removeItem = (index: number) => {
        updateField('items', data.items.filter((_, i) => i !== index));
    };

    const addItem = () => {
        updateField('items', [
            ...data.items,
            { title: '', description: '', icon: 'Check' },
        ]);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Benefits</h3>
                <p className="text-sm text-neutral-500 mb-6">
                    Highlight the key benefits of this service.
                </p>
            </div>

            <div className="grid gap-6">
                {/* Section Title */}
                <div className="space-y-2">
                    <Label htmlFor="benefits-title">Section Title</Label>
                    <Input
                        id="benefits-title"
                        value={data.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        placeholder="e.g., Why Choose Us?"
                    />
                </div>

                {/* Section Description */}
                <div className="space-y-2">
                    <Label htmlFor="benefits-description">Description (Optional)</Label>
                    <Textarea
                        id="benefits-description"
                        value={data.description || ''}
                        onChange={(e) => updateField('description', e.target.value)}
                        placeholder="Brief description..."
                        rows={2}
                    />
                </div>

                {/* Benefits List */}
                <div className="space-y-4">
                    <Label>Benefits</Label>

                    <div className="grid gap-4">
                        {data.items.map((item, index) => (
                            <div key={index} className="border rounded-lg p-4 bg-neutral-50 space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="flex-1 grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs">Title *</Label>
                                            <Input
                                                value={item.title}
                                                onChange={(e) => updateItem(index, { ...item, title: e.target.value })}
                                                placeholder="e.g., Expert Support"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Icon</Label>
                                            <IconPicker
                                                value={item.icon}
                                                onChange={(icon) => updateItem(index, { ...item, icon })}
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeItem(index)}
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Description</Label>
                                    <Textarea
                                        value={item.description}
                                        onChange={(e) => updateItem(index, { ...item, description: e.target.value })}
                                        placeholder="Describe this benefit..."
                                        rows={2}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={addItem}
                        className="w-full border-dashed"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Benefit
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default BenefitsSection;

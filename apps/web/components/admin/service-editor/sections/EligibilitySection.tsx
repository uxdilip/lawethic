'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { IconPicker } from '../IconPicker';
import { EligibilityContent, EligibilityEntity } from '@lawethic/appwrite/types';

interface EligibilitySectionProps {
    content: EligibilityContent | undefined;
    onChange: (content: EligibilityContent) => void;
}

export function EligibilitySection({ content, onChange }: EligibilitySectionProps) {
    const data: EligibilityContent = content || {
        title: 'Who Can Apply?',
        description: '',
        entities: [],
    };

    const updateField = <K extends keyof EligibilityContent>(field: K, value: EligibilityContent[K]) => {
        onChange({ ...data, [field]: value });
    };

    const updateEntity = (index: number, entity: EligibilityEntity) => {
        const updated = [...data.entities];
        updated[index] = entity;
        updateField('entities', updated);
    };

    const removeEntity = (index: number) => {
        updateField('entities', data.entities.filter((_, i) => i !== index));
    };

    const addEntity = () => {
        updateField('entities', [
            ...data.entities,
            { name: '', icon: 'User' },
        ]);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Eligibility</h3>
                <p className="text-sm text-neutral-500 mb-6">
                    Define who is eligible to apply for this service.
                </p>
            </div>

            <div className="grid gap-6">
                {/* Section Title */}
                <div className="space-y-2">
                    <Label htmlFor="eligibility-title">Section Title</Label>
                    <Input
                        id="eligibility-title"
                        value={data.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        placeholder="e.g., Who Can Apply?"
                    />
                </div>

                {/* Section Description */}
                <div className="space-y-2">
                    <Label htmlFor="eligibility-description">Description (Optional)</Label>
                    <Textarea
                        id="eligibility-description"
                        value={data.description || ''}
                        onChange={(e) => updateField('description', e.target.value)}
                        placeholder="Brief description about eligibility..."
                        rows={2}
                    />
                </div>

                {/* Eligible Entities */}
                <div className="space-y-4">
                    <Label>Eligible Entity Types</Label>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {data.entities.map((entity, index) => (
                            <div key={index} className="border rounded-lg p-4 bg-neutral-50 space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <Label className="text-xs">Entity Name</Label>
                                            <Input
                                                value={entity.name}
                                                onChange={(e) => updateEntity(index, { ...entity, name: e.target.value })}
                                                placeholder="e.g., Individuals"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Icon</Label>
                                            <IconPicker
                                                value={entity.icon}
                                                onChange={(icon) => updateEntity(index, { ...entity, icon })}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeEntity(index)}
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={addEntity}
                        className="w-full border-dashed"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Entity Type
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default EligibilitySection;

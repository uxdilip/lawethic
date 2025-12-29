'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrayField } from '../ArrayField';
import { DocumentsContent, DocumentGroupContent } from '@lawethic/appwrite/types';

interface DocumentsSectionProps {
    content: DocumentsContent | undefined;
    onChange: (content: DocumentsContent) => void;
}

export function DocumentsSection({ content, onChange }: DocumentsSectionProps) {
    const data: DocumentsContent = content || {
        title: 'Documents Required',
        description: '',
        groups: [],
    };

    const updateField = <K extends keyof DocumentsContent>(field: K, value: DocumentsContent[K]) => {
        onChange({ ...data, [field]: value });
    };

    const updateGroup = (index: number, group: DocumentGroupContent) => {
        const updated = [...data.groups];
        updated[index] = group;
        updateField('groups', updated);
    };

    const removeGroup = (index: number) => {
        updateField('groups', data.groups.filter((_, i) => i !== index));
    };

    const addGroup = () => {
        updateField('groups', [
            ...data.groups,
            { entityType: '', items: [] },
        ]);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Documents Required</h3>
                <p className="text-sm text-neutral-500 mb-6">
                    Specify documents required for different entity types.
                </p>
            </div>

            <div className="grid gap-6">
                {/* Section Title */}
                <div className="space-y-2">
                    <Label htmlFor="docs-title">Section Title</Label>
                    <Input
                        id="docs-title"
                        value={data.title || ''}
                        onChange={(e) => updateField('title', e.target.value)}
                        placeholder="e.g., Documents Required"
                    />
                </div>

                {/* Section Description */}
                <div className="space-y-2">
                    <Label htmlFor="docs-description">Description (Optional)</Label>
                    <Textarea
                        id="docs-description"
                        value={data.description || ''}
                        onChange={(e) => updateField('description', e.target.value)}
                        placeholder="Brief description about document requirements..."
                        rows={2}
                    />
                </div>

                {/* Document Groups */}
                <div className="space-y-4">
                    <Label>Document Groups</Label>

                    {data.groups.map((group, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-neutral-50 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <Label>Entity Type</Label>
                                    <Input
                                        value={group.entityType}
                                        onChange={(e) => updateGroup(index, { ...group, entityType: e.target.value })}
                                        placeholder="e.g., Individuals, Companies, LLPs"
                                        className="mt-1"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeGroup(index)}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 mt-6"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div>
                                <Label>Required Documents</Label>
                                <div className="mt-2">
                                    <ArrayField
                                        items={group.items}
                                        onChange={(items) => updateGroup(index, { ...group, items })}
                                        placeholder="e.g., PAN Card, Address Proof"
                                        addButtonText="Add Document"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <Button
                        type="button"
                        variant="outline"
                        onClick={addGroup}
                        className="w-full border-dashed"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Entity Group
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default DocumentsSection;

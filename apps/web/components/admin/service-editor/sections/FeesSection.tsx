'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FeesContent, FeeRowContent } from '@lawethic/appwrite/types';

interface FeesSectionProps {
    content: FeesContent | undefined;
    onChange: (content: FeesContent) => void;
}

export function FeesSection({ content, onChange }: FeesSectionProps) {
    const data: FeesContent = content || {
        title: 'Government Fees',
        description: '',
        table: [],
    };

    const updateField = <K extends keyof FeesContent>(field: K, value: FeesContent[K]) => {
        onChange({ ...data, [field]: value });
    };

    const updateRow = (index: number, row: FeeRowContent) => {
        const updated = [...data.table];
        updated[index] = row;
        updateField('table', updated);
    };

    const removeRow = (index: number) => {
        updateField('table', data.table.filter((_, i) => i !== index));
    };

    const addRow = () => {
        updateField('table', [
            ...data.table,
            { entityType: '', eFiling: '', physical: '', notes: '' },
        ]);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Government Fees</h3>
                <p className="text-sm text-neutral-500 mb-6">
                    Specify government fees for different entity types.
                </p>
            </div>

            <div className="grid gap-6">
                {/* Section Title */}
                <div className="space-y-2">
                    <Label htmlFor="fees-title">Section Title</Label>
                    <Input
                        id="fees-title"
                        value={data.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        placeholder="e.g., Government Fees"
                    />
                </div>

                {/* Section Description */}
                <div className="space-y-2">
                    <Label htmlFor="fees-description">Description (Optional)</Label>
                    <Textarea
                        id="fees-description"
                        value={data.description || ''}
                        onChange={(e) => updateField('description', e.target.value)}
                        placeholder="Brief description about fees..."
                        rows={2}
                    />
                </div>

                {/* Fee Table */}
                <div className="space-y-4">
                    <Label>Fee Structure</Label>

                    {/* Table Header */}
                    <div className="hidden sm:grid sm:grid-cols-5 gap-4 px-4 py-2 bg-neutral-100 rounded-t-lg text-sm font-medium text-neutral-600">
                        <div>Entity Type</div>
                        <div>E-Filing Fee</div>
                        <div>Physical Filing</div>
                        <div>Notes</div>
                        <div></div>
                    </div>

                    <div className="space-y-3">
                        {data.table.map((row, index) => (
                            <div key={index} className="grid sm:grid-cols-5 gap-4 p-4 border rounded-lg bg-neutral-50">
                                <div className="space-y-1">
                                    <Label className="sm:hidden text-xs">Entity Type</Label>
                                    <Input
                                        value={row.entityType}
                                        onChange={(e) => updateRow(index, { ...row, entityType: e.target.value })}
                                        placeholder="e.g., Individuals"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="sm:hidden text-xs">E-Filing Fee</Label>
                                    <Input
                                        value={row.eFiling}
                                        onChange={(e) => updateRow(index, { ...row, eFiling: e.target.value })}
                                        placeholder="e.g., ₹4,500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="sm:hidden text-xs">Physical Filing</Label>
                                    <Input
                                        value={row.physical || ''}
                                        onChange={(e) => updateRow(index, { ...row, physical: e.target.value })}
                                        placeholder="e.g., ₹5,000"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="sm:hidden text-xs">Notes</Label>
                                    <Input
                                        value={row.notes || ''}
                                        onChange={(e) => updateRow(index, { ...row, notes: e.target.value })}
                                        placeholder="Optional"
                                    />
                                </div>
                                <div className="flex items-end justify-end">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeRow(index)}
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
                        onClick={addRow}
                        className="w-full border-dashed"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Fee Row
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default FeesSection;

'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArrayField } from '../ArrayField';
import { PackageContent } from '@lawethic/appwrite/types';
import { cn } from '@/lib/utils';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PackagesSectionProps {
    packages: PackageContent[];
    onChange: (packages: PackageContent[]) => void;
}

interface PackageCardProps {
    pkg: PackageContent;
    index: number;
    onChange: (index: number, pkg: PackageContent) => void;
    onRemove: (index: number) => void;
}

function SortablePackageCard({ pkg, index, onChange, onRemove }: PackageCardProps) {
    const [expanded, setExpanded] = useState(true);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: pkg.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const updateField = <K extends keyof PackageContent>(field: K, value: PackageContent[K]) => {
        onChange(index, { ...pkg, [field]: value });
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'border rounded-lg bg-white',
                isDragging && 'opacity-50 shadow-lg',
                pkg.featured && 'ring-2 ring-brand-500'
            )}
        >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b">
                <button
                    type="button"
                    className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-600"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="h-5 w-5" />
                </button>

                <div className="flex-1 flex items-center gap-3">
                    <Input
                        value={pkg.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        placeholder="Package Name"
                        className="font-medium max-w-xs"
                    />
                    {pkg.featured && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-brand-100 text-brand-700">
                            <Star className="h-3 w-3" />
                            Featured
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(index)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Content */}
            {expanded && (
                <div className="p-4 space-y-6">
                    {/* Pricing Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>Price (₹) *</Label>
                            <Input
                                type="number"
                                value={pkg.price}
                                onChange={(e) => updateField('price', parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Original Price (₹)</Label>
                            <Input
                                type="number"
                                value={pkg.originalPrice || ''}
                                onChange={(e) => updateField('originalPrice', parseInt(e.target.value) || undefined)}
                                placeholder="Optional"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Discount Text</Label>
                            <Input
                                value={pkg.discount || ''}
                                onChange={(e) => updateField('discount', e.target.value)}
                                placeholder="e.g., 33% off"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Timeline</Label>
                            <Input
                                value={pkg.timeline}
                                onChange={(e) => updateField('timeline', e.target.value)}
                                placeholder="e.g., 3 working days"
                            />
                        </div>
                    </div>

                    {/* Options Row */}
                    <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={pkg.featured}
                                onCheckedChange={(checked: boolean) => updateField('featured', checked)}
                            />
                            <Label>Featured Package</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={pkg.emiAvailable || false}
                                onCheckedChange={(checked: boolean) => updateField('emiAvailable', checked)}
                            />
                            <Label>EMI Available</Label>
                        </div>
                    </div>

                    {/* Inclusions */}
                    <div className="space-y-2">
                        <Label>Inclusions</Label>
                        <ArrayField
                            items={pkg.inclusions}
                            onChange={(items) => updateField('inclusions', items)}
                            placeholder="e.g., Expert consultation included"
                            addButtonText="Add Inclusion"
                        />
                    </div>

                    {/* Exclusions */}
                    <div className="space-y-2">
                        <Label>Exclusions</Label>
                        <ArrayField
                            items={pkg.exclusions || []}
                            onChange={(items) => updateField('exclusions', items)}
                            placeholder="e.g., Government fees not included"
                            addButtonText="Add Exclusion"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export function PackagesSection({ packages, onChange }: PackagesSectionProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = packages.findIndex(p => p.id === active.id);
            const newIndex = packages.findIndex(p => p.id === over.id);
            onChange(arrayMove(packages, oldIndex, newIndex));
        }
    };

    const handleChange = (index: number, pkg: PackageContent) => {
        const updated = [...packages];
        updated[index] = pkg;
        onChange(updated);
    };

    const handleRemove = (index: number) => {
        onChange(packages.filter((_, i) => i !== index));
    };

    const handleAdd = () => {
        const newId = `pkg-${Date.now()}`;
        onChange([
            ...packages,
            {
                id: newId,
                name: 'New Package',
                price: 0,
                timeline: '',
                featured: false,
                inclusions: [],
                exclusions: [],
            },
        ]);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Pricing Packages</h3>
                <p className="text-sm text-neutral-500 mb-6">
                    Define pricing tiers with inclusions and exclusions. Drag to reorder.
                </p>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={packages.map(p => p.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-4">
                        {packages.map((pkg, index) => (
                            <SortablePackageCard
                                key={pkg.id}
                                pkg={pkg}
                                index={index}
                                onChange={handleChange}
                                onRemove={handleRemove}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <Button
                type="button"
                variant="outline"
                onClick={handleAdd}
                className="w-full border-dashed"
            >
                <Plus className="h-4 w-4 mr-2" />
                Add Package
            </Button>
        </div>
    );
}

export default PackagesSection;

'use client';

import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ProcessStepContent } from '@lawethic/appwrite/types';
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

interface ProcessSectionProps {
    steps: ProcessStepContent[] | undefined;
    onChange: (steps: ProcessStepContent[]) => void;
}

interface StepCardProps {
    step: ProcessStepContent;
    index: number;
    onChange: (index: number, step: ProcessStepContent) => void;
    onRemove: (index: number) => void;
}

function SortableStepCard({ step, index, onChange, onRemove }: StepCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: `step-${step.step}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const updateField = <K extends keyof ProcessStepContent>(field: K, value: ProcessStepContent[K]) => {
        onChange(index, { ...step, [field]: value });
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'border rounded-lg bg-white p-4',
                isDragging && 'opacity-50 shadow-lg'
            )}
        >
            <div className="flex items-start gap-4">
                <button
                    type="button"
                    className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-600 mt-2"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="h-5 w-5" />
                </button>

                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold">
                    {step.step}
                </div>

                <div className="flex-1 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Step Title *</Label>
                            <Input
                                value={step.title}
                                onChange={(e) => updateField('title', e.target.value)}
                                placeholder="e.g., Document Submission"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Duration</Label>
                            <Input
                                value={step.duration}
                                onChange={(e) => updateField('duration', e.target.value)}
                                placeholder="e.g., 1-2 days"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={step.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            placeholder="Describe what happens in this step..."
                            rows={2}
                        />
                    </div>
                </div>

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
    );
}

export function ProcessSection({ steps, onChange }: ProcessSectionProps) {
    const data = steps || [];

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = data.findIndex(s => `step-${s.step}` === active.id);
            const newIndex = data.findIndex(s => `step-${s.step}` === over.id);
            const reordered = arrayMove(data, oldIndex, newIndex);
            // Renumber steps after reordering
            onChange(reordered.map((step, idx) => ({ ...step, step: idx + 1 })));
        }
    };

    const handleChange = (index: number, step: ProcessStepContent) => {
        const updated = [...data];
        updated[index] = step;
        onChange(updated);
    };

    const handleRemove = (index: number) => {
        const filtered = data.filter((_, i) => i !== index);
        // Renumber steps after removal
        onChange(filtered.map((step, idx) => ({ ...step, step: idx + 1 })));
    };

    const handleAdd = () => {
        onChange([
            ...data,
            {
                step: data.length + 1,
                title: '',
                description: '',
                duration: '',
            },
        ]);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Process Steps</h3>
                <p className="text-sm text-neutral-500 mb-6">
                    Define the step-by-step process for this service. Drag to reorder.
                </p>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={data.map(s => `step-${s.step}`)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-4">
                        {data.map((step, index) => (
                            <SortableStepCard
                                key={`step-${step.step}`}
                                step={step}
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
                Add Step
            </Button>
        </div>
    );
}

export default ProcessSection;

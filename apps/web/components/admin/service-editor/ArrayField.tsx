'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface ArrayFieldProps {
    items: string[];
    onChange: (items: string[]) => void;
    placeholder?: string;
    label?: string;
    addButtonText?: string;
}

interface SortableItemProps {
    id: string;
    value: string;
    index: number;
    onChange: (index: number, value: string) => void;
    onRemove: (index: number) => void;
    placeholder?: string;
}

function SortableItem({ id, value, index, onChange, onRemove, placeholder }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'flex items-center gap-2 group',
                isDragging && 'opacity-50'
            )}
        >
            <button
                type="button"
                className="cursor-grab active:cursor-grabbing p-1 text-neutral-400 hover:text-neutral-600"
                {...attributes}
                {...listeners}
            >
                <GripVertical className="h-4 w-4" />
            </button>
            <Input
                value={value}
                onChange={(e) => onChange(index, e.target.value)}
                placeholder={placeholder}
                className="flex-1"
            />
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemove(index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}

export function ArrayField({
    items,
    onChange,
    placeholder = 'Enter item...',
    label,
    addButtonText = 'Add Item',
}: ArrayFieldProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Generate stable IDs for items
    const itemIds = items.map((_, index) => `item-${index}`);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = itemIds.indexOf(active.id as string);
            const newIndex = itemIds.indexOf(over.id as string);
            onChange(arrayMove(items, oldIndex, newIndex));
        }
    };

    const handleChange = (index: number, value: string) => {
        const newItems = [...items];
        newItems[index] = value;
        onChange(newItems);
    };

    const handleRemove = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
    };

    const handleAdd = () => {
        onChange([...items, '']);
    };

    return (
        <div className="space-y-3">
            {label && (
                <label className="text-sm font-medium text-neutral-700">{label}</label>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                        {items.map((item, index) => (
                            <SortableItem
                                key={itemIds[index]}
                                id={itemIds[index]}
                                value={item}
                                index={index}
                                onChange={handleChange}
                                onRemove={handleRemove}
                                placeholder={placeholder}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAdd}
                className="w-full border-dashed"
            >
                <Plus className="h-4 w-4 mr-2" />
                {addButtonText}
            </Button>
        </div>
    );
}

export default ArrayField;

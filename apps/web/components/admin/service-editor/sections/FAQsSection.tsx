'use client';

import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '../RichTextEditor';
import { FAQContent } from '@lawethic/appwrite/types';
import { cn } from '@/lib/utils';

interface FAQsSectionProps {
    faqs: FAQContent[] | undefined;
    onChange: (faqs: FAQContent[]) => void;
}

interface FAQCardProps {
    faq: FAQContent;
    index: number;
    onChange: (index: number, faq: FAQContent) => void;
    onRemove: (index: number) => void;
}

function FAQCard({ faq, index, onChange, onRemove }: FAQCardProps) {
    const [expanded, setExpanded] = useState(true);

    return (
        <div className="border rounded-lg bg-white overflow-hidden">
            <div className="flex items-center gap-3 p-4 bg-neutral-50 border-b">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                </span>
                <Input
                    value={faq.question}
                    onChange={(e) => onChange(index, { ...faq, question: e.target.value })}
                    placeholder="Enter the question..."
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0 font-medium"
                />
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

            {expanded && (
                <div className="p-4">
                    <Label className="mb-2 block">Answer</Label>
                    <RichTextEditor
                        content={faq.answer}
                        onChange={(value) => onChange(index, { ...faq, answer: value })}
                        placeholder="Write the answer..."
                        minHeight="150px"
                    />
                </div>
            )}
        </div>
    );
}

export function FAQsSection({ faqs, onChange }: FAQsSectionProps) {
    const data = faqs || [];

    const handleChange = (index: number, faq: FAQContent) => {
        const updated = [...data];
        updated[index] = faq;
        onChange(updated);
    };

    const handleRemove = (index: number) => {
        onChange(data.filter((_, i) => i !== index));
    };

    const handleAdd = () => {
        onChange([
            ...data,
            {
                question: '',
                answer: '',
            },
        ]);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Frequently Asked Questions</h3>
                <p className="text-sm text-neutral-500 mb-6">
                    Add common questions and answers about this service.
                </p>
            </div>

            <div className="space-y-4">
                {data.map((faq, index) => (
                    <FAQCard
                        key={index}
                        faq={faq}
                        index={index}
                        onChange={handleChange}
                        onRemove={handleRemove}
                    />
                ))}
            </div>

            <Button
                type="button"
                variant="outline"
                onClick={handleAdd}
                className="w-full border-dashed"
            >
                <Plus className="h-4 w-4 mr-2" />
                Add FAQ
            </Button>
        </div>
    );
}

export default FAQsSection;

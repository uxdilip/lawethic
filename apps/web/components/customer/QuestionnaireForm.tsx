'use client';

import { useState } from 'react';
import { QuestionnaireTemplate, QuestionField } from '@/data/questionnaires/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionnaireFormProps {
    questionnaireId: string;
    template: QuestionnaireTemplate;
    onSubmitSuccess?: () => void;
    userId: string;
    userName: string;
}

export function QuestionnaireForm({
    questionnaireId,
    template,
    onSubmitSuccess,
    userId,
    userName
}: QuestionnaireFormProps) {
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const updateField = (fieldId: string, value: any) => {
        setFormData(prev => ({ ...prev, [fieldId]: value }));
        if (errors[fieldId]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldId];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        for (const section of template.sections) {
            for (const field of section.fields) {
                if (field.required && !formData[field.id]) {
                    newErrors[field.id] = 'Required';
                }
                if (field.type === 'email' && formData[field.id]) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(formData[field.id])) {
                        newErrors[field.id] = 'Invalid email';
                    }
                }
                if (field.type === 'phone' && formData[field.id]) {
                    const phoneRegex = /^[\d\s+\-()]{10,}$/;
                    if (!phoneRegex.test(formData[field.id])) {
                        newErrors[field.id] = 'Invalid phone';
                    }
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            setSubmitError('Please fill in all required fields');
            const firstErrorField = document.querySelector('[data-error="true"]');
            firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const response = await fetch('/api/questionnaires/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questionnaireId,
                    responseData: formData,
                    submittedBy: userId,
                    submittedByName: userName
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to submit questionnaire');
            }

            setSubmitSuccess(true);
            onSubmitSuccess?.();
        } catch (error: any) {
            console.error('Submit error:', error);
            setSubmitError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitSuccess) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Submitted Successfully!
                </h3>
                <p className="text-green-600 text-sm">
                    Our team will review your responses shortly.
                </p>
            </div>
        );
    }

    const totalRequired = template.sections.reduce((acc, s) =>
        acc + s.fields.filter(f => f.required).length, 0);
    const filledRequired = template.sections.reduce((acc, s) =>
        acc + s.fields.filter(f => f.required && formData[f.id]).length, 0);
    const progress = totalRequired > 0 ? Math.round((filledRequired / totalRequired) * 100) : 0;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header with progress */}
            <div className="bg-white border border-neutral-200 rounded-lg p-4 sticky top-0 z-10">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="font-semibold text-neutral-900">{template.name}</h2>
                    <span className="text-sm text-neutral-500">{progress}% complete</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                        className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                {submitError && (
                    <Alert variant="destructive" className="mt-3">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                )}
            </div>

            {/* All sections in one continuous form */}
            <div className="space-y-6">
                {template.sections.map((section) => (
                    <div key={section.id} className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                        <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
                            <h3 className="font-medium text-neutral-900">{section.title}</h3>
                            {section.description && (
                                <p className="text-sm text-neutral-500 mt-0.5">{section.description}</p>
                            )}
                        </div>
                        <div className="p-4 space-y-4">
                            {section.fields.map((field) => (
                                <FieldRenderer
                                    key={field.id}
                                    field={field}
                                    value={formData[field.id]}
                                    onChange={(value) => updateField(field.id, value)}
                                    error={errors[field.id]}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Submit button */}
            <div className="sticky bottom-0 bg-white border-t border-neutral-200 p-4 -mx-4 -mb-4 mt-6">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-brand-600 hover:bg-brand-700"
                    size="lg"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        'Submit Questionnaire'
                    )}
                </Button>
            </div>
        </form>
    );
}

interface FieldRendererProps {
    field: QuestionField;
    value: any;
    onChange: (value: any) => void;
    error?: string;
}

function FieldRenderer({ field, value, onChange, error }: FieldRendererProps) {
    const hasError = !!error;

    return (
        <div className="space-y-1.5" data-error={hasError}>
            <div className="flex items-center gap-1.5">
                <Label htmlFor={field.id} className={cn("text-sm", hasError && "text-red-500")}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-0.5">*</span>}
                </Label>
                {field.helpText && (
                    <div className="group relative">
                        <HelpCircle className="w-3.5 h-3.5 text-neutral-400 cursor-help" />
                        <div className="absolute left-0 top-5 z-20 hidden group-hover:block w-56 p-2 text-xs bg-neutral-900 text-white rounded shadow-lg">
                            {field.helpText}
                        </div>
                    </div>
                )}
                {hasError && <span className="text-xs text-red-500 ml-auto">{error}</span>}
            </div>

            {field.type === 'text' && (
                <Input
                    id={field.id}
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder}
                    className={cn("h-9", hasError && "border-red-500")}
                />
            )}

            {field.type === 'email' && (
                <Input
                    id={field.id}
                    type="email"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder}
                    className={cn("h-9", hasError && "border-red-500")}
                />
            )}

            {field.type === 'phone' && (
                <Input
                    id={field.id}
                    type="tel"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder}
                    className={cn("h-9", hasError && "border-red-500")}
                />
            )}

            {field.type === 'date' && (
                <Input
                    id={field.id}
                    type="date"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className={cn("h-9", hasError && "border-red-500")}
                />
            )}

            {field.type === 'textarea' && (
                <Textarea
                    id={field.id}
                    value={value || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                    className={cn(hasError && "border-red-500")}
                />
            )}

            {field.type === 'select' && field.options && (
                <Select value={value || ''} onValueChange={onChange}>
                    <SelectTrigger className={cn("h-9", hasError && "border-red-500")}>
                        <SelectValue placeholder={field.placeholder || 'Select...'} />
                    </SelectTrigger>
                    <SelectContent>
                        {field.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {field.type === 'radio' && field.options && (
                <RadioGroup value={value || ''} onValueChange={onChange} className="flex flex-wrap gap-x-4 gap-y-2">
                    {field.options.map((option) => (
                        <div key={option.value} className="flex items-center space-x-1.5">
                            <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                            <Label htmlFor={`${field.id}-${option.value}`} className="font-normal text-sm cursor-pointer">
                                {option.label}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            )}

            {field.type === 'checkbox' && field.options && (
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {field.options.map((option) => {
                        const checked = Array.isArray(value) && value.includes(option.value);
                        return (
                            <div key={option.value} className="flex items-center space-x-1.5">
                                <Checkbox
                                    id={`${field.id}-${option.value}`}
                                    checked={checked}
                                    onCheckedChange={(isChecked: boolean) => {
                                        const currentValues = Array.isArray(value) ? value : [];
                                        if (isChecked) {
                                            onChange([...currentValues, option.value]);
                                        } else {
                                            onChange(currentValues.filter((v: string) => v !== option.value));
                                        }
                                    }}
                                />
                                <Label htmlFor={`${field.id}-${option.value}`} className="font-normal text-sm cursor-pointer">
                                    {option.label}
                                </Label>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Loader2,
    Building2,
    Briefcase,
    Scale,
    ArrowRight,
    ArrowLeft,
    Upload,
    X,
    CheckCircle,
} from 'lucide-react';
import {
    BusinessType,
    CaseType,
    BUSINESS_TYPE_LABELS,
    CASE_TYPE_LABELS,
} from '@lawethic/appwrite/types';

interface CaseSubmissionFormProps {
    userEmail?: string;
    userName?: string;
    userPhone?: string;
    isLoggedIn?: boolean;
}

const BUSINESS_TYPE_OPTIONS: { value: BusinessType; label: string; icon: React.ReactNode; description: string }[] = [
    {
        value: 'startup',
        label: BUSINESS_TYPE_LABELS['startup'],
        icon: <Building2 className="h-6 w-6" />,
        description: 'Planning to register a new company or business',
    },
    {
        value: 'existing_business',
        label: BUSINESS_TYPE_LABELS['existing_business'],
        icon: <Briefcase className="h-6 w-6" />,
        description: 'Need help with compliance, filings, or expansion',
    },
    {
        value: 'legal',
        label: BUSINESS_TYPE_LABELS['legal'],
        icon: <Scale className="h-6 w-6" />,
        description: 'Legal consultations, disputes, or resolutions',
    },
];

const CASE_TYPE_OPTIONS: { value: CaseType; label: string; businessTypes: BusinessType[] }[] = [
    // Startup categories - simplified
    { value: 'start-pvt-ltd', label: 'Company Registration', businessTypes: ['startup'] },
    { value: 'gst-matters', label: 'GST & Tax', businessTypes: ['startup', 'existing_business'] },
    { value: 'trademark-ip', label: 'Trademark & IP', businessTypes: ['startup', 'existing_business', 'legal'] },
    { value: 'general-query', label: 'Other / General Query', businessTypes: ['startup', 'existing_business', 'legal'] },
    // Existing business categories - simplified
    { value: 'annual-compliance', label: 'Compliance & Filings', businessTypes: ['existing_business'] },
    { value: 'funding-investment', label: 'Funding & Investment', businessTypes: ['startup', 'existing_business'] },
    // Legal categories
    { value: 'legal-docs', label: 'Legal Documentation', businessTypes: ['legal'] },
    { value: 'tax-matters', label: 'Tax Matters', businessTypes: ['legal'] },
];

export function CaseSubmissionForm({
    userEmail = '',
    userName = '',
    userPhone = '',
    isLoggedIn = false,
}: CaseSubmissionFormProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [businessType, setBusinessType] = useState<BusinessType | ''>('');
    const [caseType, setCaseType] = useState<CaseType | ''>('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [name, setName] = useState(userName);
    const [email, setEmail] = useState(userEmail);
    const [phone, setPhone] = useState(userPhone);

    const filteredCaseTypes = businessType
        ? CASE_TYPE_OPTIONS.filter((ct) => ct.businessTypes.includes(businessType))
        : [];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setAttachments((prev) => [...prev, ...newFiles].slice(0, 5)); // Max 5 files
        }
    };

    const removeFile = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Upload attachments first if any
            const attachmentIds: string[] = [];
            for (const file of attachments) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('bucket', 'consultation-attachments');

                const uploadRes = await fetch('/api/documents/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (uploadRes.ok) {
                    const { fileId } = await uploadRes.json();
                    attachmentIds.push(fileId);
                }
            }

            // Create case
            const response = await fetch('/api/consultations/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessType,
                    caseType,
                    title,
                    description,
                    attachments: attachmentIds,
                    customerName: name,
                    customerEmail: email,
                    customerPhone: phone,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit case');
            }

            const { caseId, caseNumber } = await response.json();

            // Redirect to success/booking page
            router.push(`/consult-expert/success?caseId=${caseId}&caseNumber=${caseNumber}`);
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const canProceedStep1 = businessType !== '';
    const canProceedStep2 = title.trim() !== '' && description.trim() !== '';
    const canSubmit = name.trim() !== '' && email.trim() !== '' && phone.trim() !== '';

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Tell Us About Your Requirement</CardTitle>
                <CardDescription>
                    Fill in the details below and our expert will guide you with the right services.
                </CardDescription>
                {/* Progress indicator */}
                <div className="flex items-center gap-2 mt-4">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-500'
                                    }`}
                            >
                                {step > s ? <CheckCircle className="h-4 w-4" /> : s}
                            </div>
                            {s < 3 && (
                                <div
                                    className={`w-12 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit}>
                    {/* Step 1: Business Type */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <Label className="text-base font-medium">
                                What best describes your situation?
                            </Label>
                            <div className="grid gap-3">
                                {BUSINESS_TYPE_OPTIONS.map((option) => (
                                    <div
                                        key={option.value}
                                        onClick={() => setBusinessType(option.value)}
                                        className={`p-4 border rounded-lg cursor-pointer transition-all ${businessType === option.value
                                            ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`p-2 rounded-lg ${businessType === option.value
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}
                                            >
                                                {option.icon}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {option.label}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {option.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    disabled={!canProceedStep1}
                                >
                                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Case Details */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="title">Brief Title <span className="text-red-500">*</span></Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Need help registering my tech startup"
                                    className="mt-1"
                                    maxLength={200}
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Describe Your Requirement <span className="text-red-500">*</span></Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Tell us more about your business, what you're trying to achieve, and any specific questions you have..."
                                    className="mt-1 min-h-[120px]"
                                    maxLength={2000}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {description.length}/2000 characters
                                </p>
                            </div>

                            {filteredCaseTypes.length > 0 && (
                                <div>
                                    <Label htmlFor="caseType">Category <span className="text-gray-400 font-normal">(Optional)</span></Label>
                                    <Select
                                        value={caseType}
                                        onValueChange={(value) => setCaseType(value as CaseType)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select if you know the category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredCaseTypes.map((ct) => (
                                                <SelectItem key={ct.value} value={ct.value}>
                                                    {ct.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Don&apos;t worry if you&apos;re unsure — our expert will guide you
                                    </p>
                                </div>
                            )}

                            <div>
                                <Label>Attachments (Optional)</Label>
                                <div className="mt-1 border-2 border-dashed border-gray-200 rounded-lg p-4">
                                    <input
                                        type="file"
                                        id="attachments"
                                        multiple
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="attachments"
                                        className="flex flex-col items-center cursor-pointer"
                                    >
                                        <Upload className="h-8 w-8 text-gray-400" />
                                        <p className="text-sm text-gray-500 mt-2">
                                            Click to upload or drag files here
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            PDF, DOC, Images, Excel (Max 5 files, 10MB each)
                                        </p>
                                    </label>
                                </div>
                                {attachments.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {attachments.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                            >
                                                <span className="text-sm truncate">
                                                    {file.name}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="p-1 hover:bg-gray-200 rounded"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStep(1)}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setStep(3)}
                                    disabled={!canProceedStep2}
                                >
                                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Contact Details */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    className="mt-1"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="mt-1"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="10-digit mobile number"
                                    className="mt-1"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-between pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStep(2)}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                                <Button type="submit" disabled={!canSubmit || loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            Submit Request
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}

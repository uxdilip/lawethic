'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { account } from '@lawethic/appwrite/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
    User,
    ArrowRight,
    ArrowLeft,
    Upload,
    X,
    CheckCircle,
    FileText,
    Calendar,
    Clock,
    MessageSquare,
    Shield,
    Sparkles,
} from 'lucide-react';
import {
    BusinessType,
    CaseType,
    BUSINESS_TYPE_LABELS,
    CASE_TYPE_LABELS,
} from '@lawethic/appwrite/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Scale } from 'lucide-react';

const BUSINESS_TYPE_OPTIONS: { value: BusinessType; label: string; icon: React.ReactNode; description: string }[] = [
    {
        value: 'startup',
        label: BUSINESS_TYPE_LABELS['startup'],
        icon: <Building2 className="h-5 w-5" />,
        description: 'Planning to register a new company or business',
    },
    {
        value: 'existing_business',
        label: BUSINESS_TYPE_LABELS['existing_business'],
        icon: <Briefcase className="h-5 w-5" />,
        description: 'Need help with compliance, filings, or expansion',
    },
    {
        value: 'legal',
        label: BUSINESS_TYPE_LABELS['legal'],
        icon: <Scale className="h-5 w-5" />,
        description: 'Legal consultations, disputes, or resolutions',
    },
];

const CASE_TYPE_OPTIONS: { value: CaseType; label: string; businessTypes: BusinessType[] }[] = [
    // Startup-only categories
    { value: 'start-pvt-ltd', label: 'Private Limited Company', businessTypes: ['startup'] },
    { value: 'start-llp', label: 'LLP Registration', businessTypes: ['startup'] },
    { value: 'start-opc', label: 'One Person Company (OPC)', businessTypes: ['startup'] },
    { value: 'start-partnership', label: 'Partnership Firm', businessTypes: ['startup'] },
    { value: 'start-proprietorship', label: 'Sole Proprietorship', businessTypes: ['startup'] },
    { value: 'gst-matters', label: 'GST Registration', businessTypes: ['startup'] },
    { value: 'trademark-ip', label: 'Trademark Registration', businessTypes: ['startup'] },
    { value: 'funding-investment', label: 'Funding & Investment', businessTypes: ['startup'] },
    { value: 'general-query', label: 'Other / General Query', businessTypes: ['startup'] },

    // Existing business-only categories
    { value: 'annual-compliance', label: 'Annual Compliance & ROC Filings', businessTypes: ['existing_business'] },
    { value: 'gst-matters', label: 'GST Filing & Returns', businessTypes: ['existing_business'] },
    { value: 'tax-matters', label: 'Income Tax & TDS', businessTypes: ['existing_business'] },
    { value: 'convert-to-pvt', label: 'Convert to Private Limited', businessTypes: ['existing_business'] },
    { value: 'trademark-ip', label: 'Trademark & IP Protection', businessTypes: ['existing_business'] },
    { value: 'hiring-hr', label: 'HR & Hiring Compliance', businessTypes: ['existing_business'] },
    { value: 'import-export', label: 'Import/Export License', businessTypes: ['existing_business'] },
    { value: 'funding-investment', label: 'Funding & Expansion', businessTypes: ['existing_business'] },
    { value: 'general-query', label: 'Other / General Query', businessTypes: ['existing_business'] },

    // Legal-only categories
    { value: 'legal-docs', label: 'Legal Documentation', businessTypes: ['legal'] },
    { value: 'trademark-ip', label: 'Trademark & IP', businessTypes: ['legal'] },
    { value: 'tax-matters', label: 'Tax Matters', businessTypes: ['legal'] },
    { value: 'ngo-trust', label: 'NGO / Trust Registration', businessTypes: ['legal'] },
    { value: 'general-query', label: 'Other / General Query', businessTypes: ['legal'] },
];

export default function NewConsultationPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // User data from account
    const [userData, setUserData] = useState<{ name: string; email: string; phone?: string } | null>(null);

    // Form state
    const [businessType, setBusinessType] = useState<BusinessType | ''>('');
    const [caseType, setCaseType] = useState<CaseType | ''>('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [phone, setPhone] = useState('');

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const user = await account.get();
            setUserData({
                name: user.name || '',
                email: user.email,
                phone: user.phone || '',
            });
            // Pre-fill phone if user has one
            if (user.phone) {
                setPhone(user.phone.replace(/\D/g, ''));
            }
        } catch (error) {
            router.push('/login');
        }
    };

    const filteredCaseTypes = businessType
        ? CASE_TYPE_OPTIONS.filter((ct) => ct.businessTypes.includes(businessType))
        : [];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setAttachments((prev) => [...prev, ...newFiles].slice(0, 5));
        }
    };

    const removeFile = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userData) return;

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

            // Store consultation data in sessionStorage (don't create case yet)
            // Case will be created when user confirms the booking slot
            const consultationData = {
                businessType,
                caseType,
                title,
                description,
                attachments: attachmentIds,
                customerName: userData.name,
                customerEmail: userData.email,
                customerPhone: phone,
            };
            sessionStorage.setItem('pendingConsultation', JSON.stringify(consultationData));

            // Redirect to booking page (no caseId since case isn't created yet)
            router.push('/dashboard/consultations/book/new');
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const canProceedStep1 = businessType !== '';
    const isValidPhone = /^\d{10}$/.test(phone);
    const canSubmit = title.trim() !== '' && description.trim() !== '' && isValidPhone;

    return (
        <div className="min-h-[calc(100vh-64px)] bg-neutral-50">
            {/* Header */}
            <div className="bg-white border-b border-neutral-200 px-4 md:px-6 py-4">
                <Link
                    href="/dashboard/consultations"
                    className="text-sm text-neutral-500 hover:text-neutral-700 mb-2 inline-block"
                >
                    ← Back to Consultations
                </Link>
                <h1 className="text-xl font-bold text-neutral-900">New Consultation</h1>
                <p className="text-neutral-500 text-sm mt-1">
                    Tell us about your requirement and book a free consultation with our expert
                </p>
            </div>

            {/* Main Content - Two Column Layout */}
            <div className="p-4 md:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border border-neutral-200 p-6">
                            {/* Progress Steps */}
                            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-neutral-100">
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                                        step >= 1 ? "bg-brand-600 text-white" : "bg-neutral-200 text-neutral-500"
                                    )}>
                                        {step > 1 ? <CheckCircle className="h-4 w-4" /> : '1'}
                                    </div>
                                    <span className={cn("text-sm font-medium", step >= 1 ? "text-brand-600" : "text-neutral-500")}>
                                        Business Type
                                    </span>
                                </div>
                                <div className={cn("flex-1 h-0.5", step > 1 ? "bg-brand-600" : "bg-neutral-200")} />
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                                        step >= 2 ? "bg-brand-600 text-white" : "bg-neutral-200 text-neutral-500"
                                    )}>
                                        {step > 2 ? <CheckCircle className="h-4 w-4" /> : '2'}
                                    </div>
                                    <span className={cn("text-sm font-medium", step >= 2 ? "text-brand-600" : "text-neutral-500")}>
                                        Details
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {/* Step 1: Business Type */}
                                {step === 1 && (
                                    <div className="space-y-6">
                                        <div>
                                            <Label className="text-base font-medium text-neutral-900">
                                                What best describes your situation?
                                            </Label>
                                            <p className="text-sm text-neutral-500 mt-1">
                                                This helps us connect you with the right expert
                                            </p>
                                        </div>

                                        <div className="grid gap-3">
                                            {BUSINESS_TYPE_OPTIONS.map((option) => (
                                                <div
                                                    key={option.value}
                                                    onClick={() => setBusinessType(option.value)}
                                                    className={cn(
                                                        "p-4 border rounded-xl cursor-pointer transition-all",
                                                        businessType === option.value
                                                            ? "border-brand-600 bg-brand-50 ring-2 ring-brand-600"
                                                            : "border-neutral-200 hover:border-neutral-300 bg-white"
                                                    )}
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className={cn(
                                                            "p-2.5 rounded-lg transition-colors",
                                                            businessType === option.value
                                                                ? "bg-brand-600 text-white"
                                                                : "bg-neutral-100 text-neutral-600"
                                                        )}>
                                                            {option.icon}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-neutral-900">
                                                                {option.label}
                                                            </p>
                                                            <p className="text-sm text-neutral-500 mt-0.5">
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
                                                className="bg-brand-600 hover:bg-brand-700"
                                            >
                                                Continue <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Case Details */}
                                {step === 2 && (
                                    <div className="space-y-6">
                                        <div>
                                            <Label htmlFor="title" className="text-sm font-medium">
                                                Brief Title <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="title"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="e.g., Need help registering my tech startup"
                                                className="mt-2"
                                                maxLength={200}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="description" className="text-sm font-medium">
                                                Describe Your Requirement <span className="text-red-500">*</span>
                                            </Label>
                                            <Textarea
                                                id="description"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="Tell us more about your business, what you're trying to achieve, and any specific questions..."
                                                className="mt-2 min-h-[120px]"
                                                maxLength={2000}
                                            />
                                            <p className="text-xs text-neutral-400 mt-1 text-right">
                                                {description.length}/2000
                                            </p>
                                        </div>

                                        {filteredCaseTypes.length > 0 && (
                                            <div>
                                                <Label htmlFor="caseType" className="text-sm font-medium">
                                                    Category <span className="text-neutral-400 font-normal">(Optional)</span>
                                                </Label>
                                                <Select
                                                    value={caseType}
                                                    onValueChange={(value) => setCaseType(value as CaseType)}
                                                >
                                                    <SelectTrigger className="mt-2">
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
                                                <p className="text-xs text-neutral-400 mt-1">
                                                    Don&apos;t worry if you&apos;re unsure — our expert will guide you
                                                </p>
                                            </div>
                                        )}

                                        <div>
                                            <Label htmlFor="phone" className="text-sm font-medium">
                                                Phone Number <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                placeholder="10-digit mobile number"
                                                className="mt-2"
                                                maxLength={10}
                                            />
                                            {phone && !isValidPhone && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    Please enter a valid 10-digit phone number
                                                </p>
                                            )}
                                            <p className="text-xs text-neutral-400 mt-1">
                                                We&apos;ll use this to contact you for the consultation
                                            </p>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium">Attachments (Optional)</Label>
                                            <div className="mt-2 border-2 border-dashed border-neutral-200 rounded-xl p-6 hover:border-neutral-300 transition-colors bg-neutral-50">
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
                                                    <Upload className="h-8 w-8 text-neutral-400" />
                                                    <p className="text-sm text-neutral-600 mt-2">
                                                        Click to upload files
                                                    </p>
                                                    <p className="text-xs text-neutral-400 mt-1">
                                                        PDF, DOC, Images, Excel (Max 5 files)
                                                    </p>
                                                </label>
                                            </div>
                                            {attachments.length > 0 && (
                                                <div className="mt-3 space-y-2">
                                                    {attachments.map((file, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="h-4 w-4 text-neutral-400" />
                                                                <span className="text-sm truncate max-w-[200px]">
                                                                    {file.name}
                                                                </span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFile(index)}
                                                                className="p-1 hover:bg-neutral-200 rounded"
                                                            >
                                                                <X className="h-4 w-4 text-neutral-500" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {error && (
                                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                                {error}
                                            </div>
                                        )}

                                        <div className="flex justify-between pt-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setStep(1)}
                                            >
                                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={!canSubmit || loading}
                                                className="bg-brand-600 hover:bg-brand-700"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Creating...
                                                    </>
                                                ) : (
                                                    <>
                                                        Continue to Book Slot
                                                        <Calendar className="ml-2 h-4 w-4" />
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Right Column - Info Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl border border-neutral-200 p-6 sticky top-6">
                            <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-brand-600" />
                                How It Works
                            </h3>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                                        <FileText className="h-4 w-4 text-brand-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-900">Submit your query</p>
                                        <p className="text-xs text-neutral-500 mt-0.5">Tell us about your requirement</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                                        <Calendar className="h-4 w-4 text-brand-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-900">Book a free slot</p>
                                        <p className="text-xs text-neutral-500 mt-0.5">Choose a convenient time</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                                        <MessageSquare className="h-4 w-4 text-brand-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-900">Talk to an expert</p>
                                        <p className="text-xs text-neutral-500 mt-0.5">Get personalized guidance</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-neutral-100">
                                <div className="flex items-center gap-2 text-sm text-neutral-600">
                                    <Clock className="h-4 w-4 text-neutral-400" />
                                    <span>15-30 min consultation</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-neutral-600 mt-2">
                                    <Shield className="h-4 w-4 text-neutral-400" />
                                    <span>100% confidential</span>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100">
                                <p className="text-sm font-medium text-green-800">✓ Free Consultation</p>
                                <p className="text-xs text-green-600 mt-1">No charges for the initial consultation</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

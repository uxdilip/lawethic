'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { account, databases, appwriteConfig } from '@lawethic/appwrite';
import { ID } from 'appwrite';
import { getServiceBySlug } from '@/data/services';
import { cn } from '@/lib/utils';
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Clock,
    Shield,
    Sparkles,
    Check,
    Star,
    CreditCard,
    Loader2,
    Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoginModal from '@/components/LoginModal';
import PaymentButton from '@/components/PaymentButton';

// Step definitions
type Step = 'lead' | 'questions' | 'packages' | 'payment' | 'confirmation';

function OnboardingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const serviceSlug = searchParams.get('service');
    const preSelectedPackage = searchParams.get('package');
    const skipLead = searchParams.get('skipLead') === 'true';

    // User state
    const [user, setUser] = useState<any>(null);
    const [checkingAuth, setCheckingAuth] = useState(true);

    // Flow state
    const [currentStep, setCurrentStep] = useState<Step>('lead');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Service data
    const [service, setService] = useState<any>(null);

    // Form data
    const [leadData, setLeadData] = useState({
        name: '',
        email: '',
        phone: '',
    });
    const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});
    const [selectedPackage, setSelectedPackage] = useState<any>(null);

    // Order data
    const [orderId, setOrderId] = useState('');
    const [orderNumber, setOrderNumber] = useState('');

    // Login modal
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Load service and check auth
    useEffect(() => {
        const init = async () => {
            // Load service
            if (serviceSlug) {
                const svc = getServiceBySlug(serviceSlug);
                if (svc) {
                    setService(svc);
                    // Pre-select package if specified
                    if (preSelectedPackage && svc.packages) {
                        const pkg = svc.packages.find((p: any) => p.id === preSelectedPackage);
                        if (pkg) setSelectedPackage(pkg);
                    }
                }
            }

            // Check auth
            try {
                const userData = await account.get();
                setUser(userData);
                setLeadData({
                    name: userData.name || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                });

                // If logged in and skipLead is true, skip to questions or packages
                if (skipLead) {
                    const svc = getServiceBySlug(serviceSlug || '');
                    if (svc?.onboardingQuestions && svc.onboardingQuestions.length > 0) {
                        setCurrentStep('questions');
                    } else {
                        setCurrentStep('packages');
                    }
                } else if (userData) {
                    // Even without skipLead, logged-in users skip lead capture
                    const svc = getServiceBySlug(serviceSlug || '');
                    if (svc?.onboardingQuestions && svc.onboardingQuestions.length > 0) {
                        setCurrentStep('questions');
                    } else {
                        setCurrentStep('packages');
                    }
                }
            } catch {
                // Not logged in - start from lead capture
                setCurrentStep('lead');
            } finally {
                setCheckingAuth(false);
            }
        };

        init();
    }, [serviceSlug, preSelectedPackage, skipLead]);

    // Get current step number for progress
    const getStepNumber = () => {
        const hasQuestions = service?.onboardingQuestions?.length > 0;
        const isLoggedIn = !!user;

        if (isLoggedIn) {
            // Logged in: Questions(1) -> Packages(2) -> Payment(3) -> Confirm(4)
            // Or if no questions: Packages(1) -> Payment(2) -> Confirm(3)
            switch (currentStep) {
                case 'questions': return 1;
                case 'packages': return hasQuestions ? 2 : 1;
                case 'payment': return hasQuestions ? 3 : 2;
                case 'confirmation': return hasQuestions ? 4 : 3;
                default: return 1;
            }
        } else {
            // Not logged in: Lead(1) -> Questions(2) -> Packages(3) -> Payment(4) -> Confirm(5)
            switch (currentStep) {
                case 'lead': return 1;
                case 'questions': return 2;
                case 'packages': return hasQuestions ? 3 : 2;
                case 'payment': return hasQuestions ? 4 : 3;
                case 'confirmation': return hasQuestions ? 5 : 4;
                default: return 1;
            }
        }
    };

    const getTotalSteps = () => {
        const hasQuestions = service?.onboardingQuestions?.length > 0;
        const isLoggedIn = !!user;

        if (isLoggedIn) {
            return hasQuestions ? 4 : 3;
        }
        return hasQuestions ? 5 : 4;
    };

    // Handle lead capture submit
    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Save lead to database
            await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: leadData.name,
                    email: leadData.email,
                    phone: leadData.phone,
                    serviceSlug: serviceSlug,
                    source: 'onboarding',
                }),
            });

            // Move to next step
            if (service?.onboardingQuestions?.length > 0) {
                setCurrentStep('questions');
            } else {
                setCurrentStep('packages');
            }
        } catch (err: any) {
            setError('Failed to save your information. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle questions submit
    const handleQuestionsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentStep('packages');
    };

    // Handle package selection and move to payment
    const handlePackageSelect = async (pkg: any) => {
        setSelectedPackage(pkg);

        // If not logged in, show login modal
        if (!user) {
            setShowLoginModal(true);
            return;
        }

        // Move to payment step
        setCurrentStep('payment');
    };

    // Create order when entering payment step
    useEffect(() => {
        const createOrder = async () => {
            if (currentStep === 'payment' && user && selectedPackage && !orderId) {
                setLoading(true);
                try {
                    const orderNum = `ORD-${Date.now()}`;
                    setOrderNumber(orderNum);

                    const formData = {
                        fullName: leadData.name || user.name,
                        email: leadData.email || user.email,
                        phone: leadData.phone || user.phone || '',
                        selectedPackage: selectedPackage.name,
                        packagePrice: selectedPackage.price,
                        onboardingAnswers: questionAnswers,
                    };

                    const orderData = {
                        orderNumber: orderNum,
                        customerId: user.$id,
                        serviceId: service.slug,
                        status: 'new',
                        paymentStatus: 'pending',
                        amount: selectedPackage.price,
                        formData: JSON.stringify(formData),
                    };

                    const order = await databases.createDocument(
                        appwriteConfig.databaseId,
                        appwriteConfig.collections.orders,
                        ID.unique(),
                        orderData
                    );

                    setOrderId(order.$id);
                } catch (err: any) {
                    console.error('Failed to create order:', err);
                    setError('Failed to create order. Please try again.');
                } finally {
                    setLoading(false);
                }
            }
        };

        createOrder();
    }, [currentStep, user, selectedPackage, orderId]);

    // Handle login success
    const handleLoginSuccess = async () => {
        setShowLoginModal(false);
        try {
            const userData = await account.get();
            setUser(userData);
            // Update lead data with user info
            setLeadData(prev => ({
                name: prev.name || userData.name || '',
                email: prev.email || userData.email || '',
                phone: prev.phone || userData.phone || '',
            }));
            // Move to payment
            setCurrentStep('payment');
        } catch (err) {
            console.error('Failed to get user after login:', err);
        }
    };

    // Handle payment success
    const handlePaymentSuccess = () => {
        setCurrentStep('confirmation');
    };

    // Go back
    const handleBack = () => {
        const hasQuestions = service?.onboardingQuestions?.length > 0;

        switch (currentStep) {
            case 'questions':
                if (!user) setCurrentStep('lead');
                break;
            case 'packages':
                if (hasQuestions) setCurrentStep('questions');
                else if (!user) setCurrentStep('lead');
                break;
            case 'payment':
                setCurrentStep('packages');
                break;
        }
    };

    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            </div>
        );
    }

    if (!service) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Service not found</h1>
                    <Link href="/services" className="text-brand-600 hover:underline">
                        Browse Services
                    </Link>
                </div>
            </div>
        );
    }

    const hasQuestions = service?.onboardingQuestions?.length > 0;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Progress Bar */}
            <div className="bg-white border-b sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <Link
                            href={`/services/${serviceSlug}`}
                            className="flex items-center text-gray-600 hover:text-gray-900 text-sm"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to {service.title}
                        </Link>
                        <span className="text-sm text-gray-500">
                            Step {getStepNumber()} of {getTotalSteps()}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(getStepNumber() / getTotalSteps()) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 py-8">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Step 1: Lead Capture (only for non-logged-in users) */}
                {currentStep === 'lead' && !user && (
                    <div className="grid lg:grid-cols-5 gap-8">
                        {/* Left Panel - Service Info */}
                        <div className="lg:col-span-2">
                            <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-6 text-white sticky top-24">
                                <h2 className="text-2xl font-bold mb-4">{service.title}</h2>
                                <p className="text-brand-100 mb-6">{service.hero?.description}</p>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Quick Processing</p>
                                            <p className="text-sm text-brand-200">{service.timeline || '7-10 days'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">100% Secure</p>
                                            <p className="text-sm text-brand-200">Your data is protected</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Expert Support</p>
                                            <p className="text-sm text-brand-200">Dedicated assistance</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel - Lead Form */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                <h1 className="text-2xl font-bold mb-2">Let's get started</h1>
                                <p className="text-gray-600 mb-6">
                                    Tell us a bit about yourself so we can help you better
                                </p>

                                <form onSubmit={handleLeadSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name *
                                        </label>
                                        <Input
                                            type="text"
                                            value={leadData.name}
                                            onChange={(e) => setLeadData(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="Enter your full name"
                                            required
                                            className="h-12"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address *
                                        </label>
                                        <Input
                                            type="email"
                                            value={leadData.email}
                                            onChange={(e) => setLeadData(prev => ({ ...prev, email: e.target.value }))}
                                            placeholder="Enter your email"
                                            required
                                            className="h-12"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number *
                                        </label>
                                        <Input
                                            type="tel"
                                            value={leadData.phone}
                                            onChange={(e) => setLeadData(prev => ({ ...prev, phone: e.target.value }))}
                                            placeholder="Enter your phone number"
                                            required
                                            className="h-12"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-base"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                Continue
                                                <ArrowRight className="w-5 h-5 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </form>

                                <div className="mt-6 text-center">
                                    <p className="text-sm text-gray-500">
                                        Already have an account?{' '}
                                        <button
                                            onClick={() => setShowLoginModal(true)}
                                            className="text-brand-600 hover:underline font-medium"
                                        >
                                            Sign in
                                        </button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Questions */}
                {currentStep === 'questions' && hasQuestions && (
                    <div className="grid lg:grid-cols-5 gap-8">
                        {/* Left Panel */}
                        <div className="lg:col-span-2">
                            <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-6 text-white sticky top-24">
                                <h2 className="text-2xl font-bold mb-4">{service.title}</h2>
                                <p className="text-brand-100 mb-6">
                                    Help us understand your requirements better
                                </p>

                                <div className="bg-white/10 rounded-xl p-4">
                                    <p className="text-sm text-brand-100">
                                        Your answers help us recommend the right package and prepare
                                        for your application.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel - Questions */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                <h1 className="text-2xl font-bold mb-2">Quick Questions</h1>
                                <p className="text-gray-600 mb-6">
                                    Just {service.onboardingQuestions.length} quick question{service.onboardingQuestions.length > 1 ? 's' : ''} to help us serve you better
                                </p>

                                <form onSubmit={handleQuestionsSubmit} className="space-y-6">
                                    {service.onboardingQuestions.map((q: any, idx: number) => (
                                        <div key={q.id} className="space-y-3">
                                            <label className="block text-base font-medium text-gray-900">
                                                {idx + 1}. {q.question}
                                            </label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {q.options.map((option: any) => {
                                                    // Handle both string and object options
                                                    const optionValue = typeof option === 'string' ? option : option.value;
                                                    const optionLabel = typeof option === 'string' ? option : option.label;

                                                    return (
                                                        <button
                                                            key={optionValue}
                                                            type="button"
                                                            onClick={() => setQuestionAnswers(prev => ({
                                                                ...prev,
                                                                [q.id]: optionValue
                                                            }))}
                                                            className={cn(
                                                                "p-4 rounded-xl border-2 text-left transition-all",
                                                                questionAnswers[q.id] === optionValue
                                                                    ? "border-brand-600 bg-brand-50 text-brand-900"
                                                                    : "border-gray-200 hover:border-gray-300"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={cn(
                                                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                                                    questionAnswers[q.id] === optionValue
                                                                        ? "border-brand-600 bg-brand-600"
                                                                        : "border-gray-300"
                                                                )}>
                                                                    {questionAnswers[q.id] === optionValue && (
                                                                        <Check className="w-3 h-3 text-white" />
                                                                    )}
                                                                </div>
                                                                <span className="font-medium">{optionLabel}</span>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}

                                    <div className="flex gap-4 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleBack}
                                            className="h-12"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Back
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1 h-12 text-base"
                                            disabled={Object.keys(questionAnswers).length < service.onboardingQuestions.length}
                                        >
                                            Continue to Packages
                                            <ArrowRight className="w-5 h-5 ml-2" />
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Package Selection - Full Width Horizontal */}
                {currentStep === 'packages' && (
                    <div>
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold mb-2">Choose Your Package</h1>
                            <p className="text-gray-600">
                                Select the package that best fits your needs
                            </p>
                        </div>

                        {/* Back Button */}
                        {(hasQuestions || !user) && (
                            <Button
                                variant="ghost"
                                onClick={handleBack}
                                className="mb-6"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        )}

                        {/* Horizontal Package Cards */}
                        <div className="grid md:grid-cols-3 gap-6">
                            {service.packages?.map((pkg: any, idx: number) => {
                                const isPopular = idx === 1; // Middle package is popular
                                const isSelected = selectedPackage?.id === pkg.id;

                                return (
                                    <div
                                        key={pkg.id}
                                        className={cn(
                                            "relative bg-white rounded-2xl border-2 transition-all duration-200",
                                            isPopular && "border-brand-600 shadow-xl scale-105",
                                            isSelected && "ring-2 ring-brand-600 ring-offset-2",
                                            !isPopular && !isSelected && "border-gray-200 hover:border-gray-300"
                                        )}
                                    >
                                        {/* Popular Badge */}
                                        {isPopular && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                                <span className="bg-brand-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                                    <Star className="w-3 h-3 fill-current" />
                                                    Most Popular
                                                </span>
                                            </div>
                                        )}

                                        <div className="p-6">
                                            {/* Package Header */}
                                            <div className="text-center mb-6">
                                                <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                                                <div className="flex items-baseline justify-center gap-1">
                                                    <span className="text-4xl font-bold">₹{pkg.price.toLocaleString()}</span>
                                                </div>
                                                {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                                                    <p className="text-sm text-gray-500 line-through mt-1">
                                                        ₹{pkg.originalPrice.toLocaleString()}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Features List */}
                                            <ul className="space-y-3 mb-6">
                                                {pkg.inclusions?.map((feature: string, fidx: number) => (
                                                    <li key={fidx} className="flex items-start gap-2">
                                                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                        <span className="text-sm text-gray-700">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            {/* Highlight */}
                                            {pkg.highlight && (
                                                <div className="bg-brand-50 rounded-lg p-3 mb-6">
                                                    <p className="text-sm text-brand-800 font-medium text-center">
                                                        {pkg.highlight}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Select Button */}
                                            <Button
                                                onClick={() => handlePackageSelect(pkg)}
                                                className={cn(
                                                    "w-full h-12",
                                                    isPopular
                                                        ? "bg-brand-600 hover:bg-brand-700"
                                                        : "bg-gray-900 hover:bg-gray-800"
                                                )}
                                            >
                                                {isSelected ? (
                                                    <>
                                                        <Check className="w-5 h-5 mr-2" />
                                                        Selected
                                                    </>
                                                ) : (
                                                    'Select Package'
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Trust Badges */}
                        <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                <span>Secure Payment</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                <span>Quick Processing</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5" />
                                <span>Money Back Guarantee</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Payment */}
                {currentStep === 'payment' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold mb-2">Complete Payment</h1>
                            <p className="text-gray-600">
                                You're almost done! Complete your payment to proceed.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            {/* Order Summary */}
                            <div className="bg-gray-50 p-6 border-b">
                                <h2 className="font-semibold text-lg mb-4">Order Summary</h2>

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Service</span>
                                        <span className="font-medium">{service.title}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Package</span>
                                        <span className="font-medium">{selectedPackage?.name}</span>
                                    </div>

                                    {/* Package Inclusions */}
                                    {selectedPackage?.inclusions && (
                                        <div className="pt-3 border-t">
                                            <p className="text-sm text-gray-500 mb-2">Includes:</p>
                                            <ul className="space-y-1">
                                                {selectedPackage.inclusions.slice(0, 4).map((item: string, idx: number) => (
                                                    <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                                                        <Check className="w-4 h-4 text-green-500" />
                                                        {item}
                                                    </li>
                                                ))}
                                                {selectedPackage.inclusions.length > 4 && (
                                                    <li className="text-sm text-gray-500">
                                                        +{selectedPackage.inclusions.length - 4} more
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Total & Payment */}
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-lg font-semibold">Total Amount</span>
                                    <span className="text-3xl font-bold text-brand-600">
                                        ₹{selectedPackage?.price?.toLocaleString()}
                                    </span>
                                </div>

                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                                        <span className="ml-3 text-gray-600">Creating your order...</span>
                                    </div>
                                ) : orderId ? (
                                    <div className="space-y-4">
                                        <PaymentButton
                                            orderId={orderId}
                                            orderNumber={orderNumber}
                                            amount={selectedPackage?.price || 0}
                                            serviceName={service.title}
                                            customerName={leadData.name || user?.name || ''}
                                            customerEmail={leadData.email || user?.email || ''}
                                            onSuccess={handlePaymentSuccess}
                                        />

                                        <Button
                                            variant="ghost"
                                            onClick={() => setCurrentStep('packages')}
                                            className="w-full"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Change Package
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-red-600">
                                        Failed to create order. Please try again.
                                    </div>
                                )}

                                {/* Security Note */}
                                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                                    <Shield className="w-4 h-4" />
                                    <span>Secured by Razorpay. 100% Safe & Secure.</span>
                                </div>
                            </div>
                        </div>

                        {/* Back Button */}
                        <div className="mt-6 text-center">
                            <Button
                                variant="ghost"
                                onClick={() => setCurrentStep('packages')}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Packages
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 5: Confirmation */}
                {currentStep === 'confirmation' && (
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>

                            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
                            <p className="text-gray-600 mb-6">
                                Thank you for your order. Your application process has begun.
                            </p>

                            <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
                                <h3 className="font-semibold mb-4">Order Details</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Order Number</span>
                                        <span className="font-mono font-medium">{orderNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Service</span>
                                        <span className="font-medium">{service.title}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Package</span>
                                        <span className="font-medium">{selectedPackage?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Amount Paid</span>
                                        <span className="font-medium text-green-600">
                                            ₹{selectedPackage?.price?.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-brand-50 rounded-xl p-4 mb-6">
                                <h4 className="font-medium text-brand-900 mb-2">What's Next?</h4>
                                <ul className="text-sm text-brand-800 space-y-1 text-left">
                                    <li className="flex items-start gap-2">
                                        <span className="font-bold">1.</span>
                                        <span>You'll receive a confirmation email shortly</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-bold">2.</span>
                                        <span>Our team will review your application</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-bold">3.</span>
                                        <span>You may be asked to upload additional documents</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() => router.push('/dashboard')}
                                    className="flex-1 h-12"
                                >
                                    Go to Dashboard
                                </Button>
                                <Button
                                    onClick={() => router.push(`/orders/${orderId}`)}
                                    className="flex-1 h-12"
                                >
                                    View Order Details
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Login Modal */}
            <LoginModal
                open={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSuccess={handleLoginSuccess}
            />
        </div>
    );
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            </div>
        }>
            <OnboardingContent />
        </Suspense>
    );
}

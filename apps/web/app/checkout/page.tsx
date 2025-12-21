'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { databases, appwriteConfig, account } from '@lawethic/appwrite';
import { Service, Order, QuestionField } from '@lawethic/appwrite/types';
import { CheckCircle, CreditCard, HelpCircle } from 'lucide-react';
import { ID, Query } from 'appwrite';
import PaymentButton from '@/components/PaymentButton';
import { getServiceBySlug } from '@/data/services';

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    // Support both old (category/slug) and new (service) URL formats
    const serviceSlug = searchParams.get('service');
    const legacyCategory = searchParams.get('category');
    const legacySlug = searchParams.get('slug');
    const serviceId = searchParams.get('serviceId');
    const selectedPackageId = searchParams.get('package');

    // Onboarding flow parameters
    const fromOnboarding = searchParams.get('fromOnboarding') === 'true';
    const onboardingName = searchParams.get('name');
    const onboardingEmail = searchParams.get('email');
    const onboardingPhone = searchParams.get('phone');
    const onboardingAnswers = searchParams.get('answers');

    const [user, setUser] = useState<any>(null);
    const [service, setService] = useState<Service | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<any>(null);
    const [finalPrice, setFinalPrice] = useState<number>(0);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [orderId, setOrderId] = useState('');
    const [orderNumber, setOrderNumber] = useState('');

    // Form data
    const [formData, setFormData] = useState<any>({});
    const [questionAnswers, setQuestionAnswers] = useState<Record<string, any>>({});

    useEffect(() => {
        init();
    }, [serviceSlug, legacyCategory, legacySlug, serviceId]);

    const init = async () => {
        setLoading(true);
        setError('');

        // Step 1: Check authentication
        try {
            const userData = await account.get();
            setUser(userData);
        } catch (authError) {
            console.error('Authentication required:', authError);
            const currentPath = window.location.pathname + window.location.search;
            router.push('/login?redirect=' + encodeURIComponent(currentPath));
            return;
        }

        // Step 2: Get service from static registry or Appwrite
        try {
            let staticService: any = null;
            let appwriteService: any = null;

            // Try new flat URL format first
            const slug = serviceSlug || legacySlug;

            if (slug) {
                // Get from static registry
                staticService = getServiceBySlug(slug);

                if (staticService) {
                    console.log('✅ Service found in registry:', staticService.title);

                    // Create a service-like object for the UI
                    appwriteService = {
                        $id: staticService.slug,
                        slug: staticService.slug,
                        name: staticService.title,
                        category: staticService.categorySlug,
                        price: staticService.basePrice,
                        shortDescription: staticService.hero.description,
                        estimatedDays: staticService.timeline,
                    };
                } else {
                    // Fallback: try to fetch from Appwrite
                    console.log('⚠️ Service not in registry, checking Appwrite...');
                    const services = await databases.listDocuments(
                        appwriteConfig.databaseId,
                        appwriteConfig.collections.services,
                        [Query.equal('slug', slug)]
                    );

                    if (services.documents.length > 0) {
                        appwriteService = services.documents[0];
                    }
                }
            } else if (serviceId) {
                // Legacy: Fetch by ID from Appwrite
                appwriteService = await databases.getDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.services,
                    serviceId
                );
            }

            if (!appwriteService && !staticService) {
                setError('Service not found. Please go back and select a service.');
                setLoading(false);
                return;
            }

            setService(appwriteService as unknown as Service);

            // Find selected package and calculate final price
            let packageData = null;
            let price = appwriteService?.price || staticService?.basePrice || 0;

            if (selectedPackageId && staticService?.packages) {
                packageData = staticService.packages.find(
                    (pkg: any) => pkg.id === selectedPackageId || pkg.name.toLowerCase() === selectedPackageId.toLowerCase()
                );

                if (packageData) {
                    price = packageData.price;
                    console.log('✅ Package found:', packageData.name, 'Price:', price);
                } else {
                    console.warn('⚠️ Package not found:', selectedPackageId);
                }
            }

            setSelectedPackage(packageData);
            setFinalPrice(price);

            // If coming from onboarding, create order and skip to payment
            if (fromOnboarding) {
                try {
                    const userData = await account.get();

                    // Parse onboarding answers if provided
                    let parsedAnswers = {};
                    if (onboardingAnswers) {
                        try {
                            parsedAnswers = JSON.parse(decodeURIComponent(onboardingAnswers));
                        } catch (e) {
                            console.warn('Failed to parse onboarding answers:', e);
                        }
                    }

                    // Pre-populate form data from onboarding
                    const onboardingFormData = {
                        fullName: onboardingName || userData.name || '',
                        email: onboardingEmail || userData.email || '',
                        phone: onboardingPhone || userData.phone || '',
                        businessName: onboardingName || userData.name || '',
                        selectedPackage: packageData?.name || selectedPackageId || 'Standard',
                        packagePrice: price,
                        onboardingAnswers: parsedAnswers,
                    };

                    setFormData(onboardingFormData);
                    setQuestionAnswers(parsedAnswers);

                    // Create order automatically
                    const orderNum = `ORD-${Date.now()}`;
                    setOrderNumber(orderNum);

                    const orderData = {
                        orderNumber: orderNum,
                        customerId: userData.$id,
                        serviceId: appwriteService.$id || staticService?.slug,
                        status: 'new',
                        paymentStatus: 'pending',
                        amount: price,
                        formData: JSON.stringify(onboardingFormData),
                    };

                    const order = await databases.createDocument(
                        appwriteConfig.databaseId,
                        appwriteConfig.collections.orders,
                        ID.unique(),
                        orderData
                    );

                    setOrderId(order.$id);
                    setStep(3); // Skip directly to payment
                    console.log('✅ Onboarding flow: Order created, skipping to payment');
                } catch (onboardingError: any) {
                    console.error('Failed to process onboarding data:', onboardingError);
                    setError('Failed to create order. Please try again.');
                }
            }
        } catch (serviceError: any) {
            console.error('Failed to load service:', serviceError);
            setError('Failed to load service details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleQuestionChange = (questionId: string, value: any) => {
        setQuestionAnswers({ ...questionAnswers, [questionId]: value });
    };

    const handleStep1Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Create order
            const orderNum = `ORD-${Date.now()}`;
            setOrderNumber(orderNum);

            // Add user email to formData
            const formDataWithEmail = {
                ...formData,
                email: user.email,
                fullName: user.name || formData.businessName,
                selectedPackage: selectedPackage?.name || selectedPackageId || 'Standard',
                packagePrice: finalPrice,
            };

            const orderData = {
                orderNumber: orderNum,
                customerId: user.$id,
                serviceId: service!.$id,
                status: 'new',
                paymentStatus: 'pending',
                amount: finalPrice,
                formData: JSON.stringify(formDataWithEmail),
            };

            const order = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                ID.unique(),
                orderData
            );

            setOrderId(order.$id);

            // Check if service has questions
            if (service?.questionForm && (typeof service.questionForm === 'string' ? JSON.parse(service.questionForm) : service.questionForm).length > 0) {
                setStep(2); // Go to questions
            } else {
                setStep(3); // Skip to payment if no questions
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    const handleStep2Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Parse existing formData
            const existingFormData = typeof formData === 'string' ? JSON.parse(formData) : formData;

            // Merge question answers with existing form data
            const updatedFormData = {
                ...existingFormData,
                serviceQuestions: questionAnswers,
            };

            // Update order with question answers
            await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                orderId,
                {
                    formData: JSON.stringify(updatedFormData),
                }
            );

            setStep(3); // Go to payment
        } catch (err: any) {
            setError(err.message || 'Failed to save answers');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = () => {
        setStep(4); // Move to confirmation step
    };

    const handleConfirm = () => {
        router.push(`/orders/${orderId}`);
    };

    // Parse question form if it's a string
    const getQuestionForm = (): QuestionField[] => {
        if (!service?.questionForm) return [];
        if (typeof service.questionForm === 'string') {
            try {
                return JSON.parse(service.questionForm);
            } catch {
                return [];
            }
        }
        return service.questionForm;
    };

    const questionForm = getQuestionForm();
    const hasQuestions = questionForm.length > 0;

    if (loading && step === 1) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Service not found</h1>
                    <Link href="/services" className="text-brand-600 hover:underline">
                        Back to Services
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Checkout Steps */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Progress Steps */}
                    <div className="flex items-center justify-center mb-8 overflow-x-auto">
                        <div className="flex items-center space-x-2 md:space-x-4">
                            {/* Step 1: Details */}
                            <div className={`flex items-center ${step >= 1 ? 'text-brand-600' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-brand-600 text-white' : 'bg-gray-300'}`}>
                                    1
                                </div>
                                <span className="ml-2 font-medium text-sm">Details</span>
                            </div>

                            {/* Step 2: Questions (only if service has questions) */}
                            {hasQuestions && (
                                <>
                                    <div className="w-8 md:w-16 h-1 bg-gray-300"></div>
                                    <div className={`flex items-center ${step >= 2 ? 'text-brand-600' : 'text-gray-400'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-brand-600 text-white' : 'bg-gray-300'}`}>
                                            2
                                        </div>
                                        <span className="ml-2 font-medium text-sm">Questions</span>
                                    </div>
                                </>
                            )}

                            {/* Step 3 (or 2 if no questions): Payment */}
                            <div className="w-8 md:w-16 h-1 bg-gray-300"></div>
                            <div className={`flex items-center ${step >= 3 ? 'text-brand-600' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-brand-600 text-white' : 'bg-gray-300'}`}>
                                    {hasQuestions ? '3' : '2'}
                                </div>
                                <span className="ml-2 font-medium text-sm">Payment</span>
                            </div>

                            {/* Step 4 (or 3 if no questions): Done */}
                            <div className="w-8 md:w-16 h-1 bg-gray-300"></div>
                            <div className={`flex items-center ${step >= 4 ? 'text-brand-600' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 4 ? 'bg-brand-600 text-white' : 'bg-gray-300'}`}>
                                    {hasQuestions ? '4' : '3'}
                                </div>
                                <span className="ml-2 font-medium text-sm">Done</span>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    {/* Step 1: Basic Details Form */}
                    {step === 1 && (
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <h2 className="text-2xl font-bold mb-6">Basic Details</h2>
                            <div className="mb-6">
                                <div className="bg-brand-50 border border-brand-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-brand-900">{service.name}</h3>
                                            {selectedPackage && (
                                                <span className="inline-block mt-1 px-2 py-1 bg-brand-600 text-white text-xs font-semibold rounded">
                                                    {selectedPackage.name} Package
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-lg font-bold text-brand-900">₹{finalPrice.toLocaleString()}</p>
                                    </div>
                                    {selectedPackage && selectedPackage.inclusions && (
                                        <div className="mt-3 pt-3 border-t border-brand-200">
                                            <p className="text-xs text-brand-700 font-medium mb-2">Package Includes:</p>
                                            <ul className="text-xs text-brand-600 space-y-1">
                                                {selectedPackage.inclusions.slice(0, 3).map((item: string, idx: number) => (
                                                    <li key={idx}>✓ {item}</li>
                                                ))}
                                                {selectedPackage.inclusions.length > 3 && (
                                                    <li>+ {selectedPackage.inclusions.length - 3} more...</li>
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <form onSubmit={handleStep1Submit}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-gray-50"
                                            value={user?.email || ''}
                                            readOnly
                                            title="Email from your account"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Using email from your account</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Business Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                            value={formData.businessName || ''}
                                            onChange={(e) => handleFormChange('businessName', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            PAN Number *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                                            placeholder="ABCDE1234F"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                            value={formData.panNumber || ''}
                                            onChange={(e) => handleFormChange('panNumber', e.target.value.toUpperCase())}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Business Address *
                                        </label>
                                        <textarea
                                            required
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                            value={formData.address || ''}
                                            onChange={(e) => handleFormChange('address', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Contact Number *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            pattern="[0-9]{10}"
                                            placeholder="9876543210"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                            value={formData.mobile || ''}
                                            onChange={(e) => handleFormChange('mobile', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-between">
                                    <Link
                                        href="/services"
                                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50"
                                    >
                                        {loading ? 'Creating...' : hasQuestions ? 'Continue to Questions' : 'Continue to Payment'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Step 2: Service-Specific Questions */}
                    {step === 2 && hasQuestions && (
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <div className="flex items-center mb-6">
                                <HelpCircle className="h-8 w-8 text-brand-600 mr-3" />
                                <h2 className="text-2xl font-bold">Additional Information</h2>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Please answer these questions to help us process your application better.
                            </p>

                            <form onSubmit={handleStep2Submit}>
                                <div className="space-y-6">
                                    {questionForm.map((question, index) => (
                                        <div key={question.id} className="pb-6 border-b last:border-b-0">
                                            <label className="block text-sm font-medium text-gray-900 mb-3">
                                                {question.label}
                                                {question.required && <span className="text-red-500 ml-1">*</span>}
                                            </label>

                                            {question.helpText && (
                                                <p className="text-sm text-gray-500 mb-3">{question.helpText}</p>
                                            )}

                                            {/* Radio buttons */}
                                            {question.type === 'radio' && (
                                                <div className="space-y-2">
                                                    {question.options?.map((option) => (
                                                        <label key={option} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name={question.id}
                                                                value={option}
                                                                required={question.required}
                                                                checked={questionAnswers[question.id] === option}
                                                                onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                                                                className="mr-3 h-4 w-4 text-brand-600"
                                                            />
                                                            <span className="text-gray-700">{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Select dropdown */}
                                            {question.type === 'select' && (
                                                <select
                                                    required={question.required}
                                                    value={questionAnswers[question.id] || ''}
                                                    onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                                >
                                                    <option value="">-- Select an option --</option>
                                                    {question.options?.map((option) => (
                                                        <option key={option} value={option}>
                                                            {option}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}

                                            {/* Text input */}
                                            {question.type === 'text' && (
                                                <input
                                                    type="text"
                                                    required={question.required}
                                                    placeholder={question.placeholder}
                                                    value={questionAnswers[question.id] || ''}
                                                    onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                                />
                                            )}

                                            {/* Textarea */}
                                            {question.type === 'textarea' && (
                                                <textarea
                                                    required={question.required}
                                                    placeholder={question.placeholder}
                                                    rows={4}
                                                    value={questionAnswers[question.id] || ''}
                                                    onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                                />
                                            )}

                                            {/* Checkbox */}
                                            {question.type === 'checkbox' && (
                                                <label className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={questionAnswers[question.id] || false}
                                                        onChange={(e) => handleQuestionChange(question.id, e.target.checked)}
                                                        className="mr-3 h-4 w-4 text-brand-600 rounded"
                                                    />
                                                    <span className="text-gray-700">{question.label}</span>
                                                </label>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 flex justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : 'Continue to Payment'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Step 3: Payment */}
                    {step === 3 && (
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <div className="flex items-center mb-6">
                                <CreditCard className="h-8 w-8 text-brand-600 mr-3" />
                                <h2 className="text-2xl font-bold">Complete Payment</h2>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                                <h3 className="font-semibold mb-4">Order Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Service</span>
                                        <span className="font-medium">{service.name}</span>
                                    </div>
                                    {selectedPackage && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Package</span>
                                            <span className="font-medium text-brand-600">{selectedPackage.name}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Processing Time</span>
                                        <span className="font-medium">{selectedPackage?.timeline || service.estimatedDays}</span>
                                    </div>
                                    <div className="border-t pt-3 mt-3">
                                        <div className="flex justify-between text-lg">
                                            <span className="font-semibold">Total Amount</span>
                                            <span className="font-bold text-brand-600">₹{finalPrice.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-yellow-800">
                                    <strong>📄 Documents Required:</strong> After payment, you'll be able to upload required documents from your order details page.
                                </p>
                            </div>

                            <PaymentButton
                                amount={finalPrice}
                                orderId={orderId}
                                orderNumber={orderNumber}
                                customerName={user?.name || ''}
                                customerEmail={user?.email || ''}
                                serviceName={service.name}
                                onSuccess={handlePaymentSuccess}
                            />

                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => setStep(hasQuestions ? 2 : 1)}
                                    className="text-gray-600 hover:text-gray-800 text-sm"
                                >
                                    ← Back to {hasQuestions ? 'Questions' : 'Details'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Confirmation */}
                    {step === 4 && (
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <div className="text-center mb-8">
                                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                                <p className="text-gray-600">
                                    Your order has been confirmed and payment received.
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Order Number</p>
                                        <p className="font-semibold">{orderNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Service</p>
                                        <p className="font-semibold">{service.name}</p>
                                    </div>
                                    {selectedPackage && (
                                        <div>
                                            <p className="text-sm text-gray-600">Package</p>
                                            <p className="font-semibold text-brand-600">{selectedPackage.name}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm text-gray-600">Amount Paid</p>
                                        <p className="font-semibold text-green-600">₹{finalPrice.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Processing Time</p>
                                        <p className="font-semibold">{service.estimatedDays}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-brand-50 border border-brand-200 rounded-lg p-6 mb-6">
                                <h3 className="font-semibold text-brand-900 mb-2">📄 Next Step: Upload Documents</h3>
                                <p className="text-sm text-brand-800 mb-3">
                                    Please upload the required documents to proceed with your application.
                                    You can do this now or later from your order details page.
                                </p>
                                <ul className="text-sm text-brand-700 space-y-1 mb-4">
                                    {service.documentRequired?.slice(0, 3).map((doc, index) => (
                                        <li key={index}>• {doc}</li>
                                    ))}
                                    {service.documentRequired && service.documentRequired.length > 3 && (
                                        <li>• And {service.documentRequired.length - 3} more...</li>
                                    )}
                                </ul>
                            </div>

                            <div className="text-center">
                                <button
                                    onClick={handleConfirm}
                                    className="px-8 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-semibold"
                                >
                                    View Order & Upload Documents
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div>Loading...</div></div>}>
            <CheckoutContent />
        </Suspense>
    );
}

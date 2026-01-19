'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { account, databases, storage, appwriteConfig, client } from '@lawethic/appwrite';
import { ID } from 'appwrite';
import {
    ArrowLeft,
    Calendar,
    Clock,
    CheckCircle,
    FileText,
    MessageSquare,
    ExternalLink,
    Send,
    Paperclip,
    Users,
    Edit3,
    CheckSquare,
    XCircle,
    ShoppingCart,
    Loader2,
    Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
    ConsultationCase,
    ConsultationStatus,
    CASE_TYPE_LABELS,
    BUSINESS_TYPE_LABELS,
    Message,
} from '@lawethic/appwrite/types';
import { getServiceBySlug } from '@/data/services';

// Progress steps matching Arcline style
const PROGRESS_STEPS = [
    { key: 'submitted', label: 'Submit case', icon: FileText, statuses: ['submitted', 'under_review', 'meeting_scheduled', 'meeting_completed', 'recommendations_sent', 'converted', 'closed'] },
    { key: 'meeting_scheduled', label: 'Meeting Scheduled', icon: Calendar, statuses: ['meeting_scheduled', 'meeting_completed', 'recommendations_sent', 'converted', 'closed'] },
    { key: 'meeting_completed', label: 'Meeting Completed', icon: CheckSquare, statuses: ['meeting_completed', 'recommendations_sent', 'converted', 'closed'] },
    { key: 'recommendations_sent', label: 'Recommendations', icon: Edit3, statuses: ['recommendations_sent', 'converted', 'closed'] },
    { key: 'closed', label: 'Case Closed', icon: CheckCircle, statuses: ['converted', 'closed'] },
];

export default function ConsultationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const caseId = params.id as string;

    const [caseData, setCaseData] = useState<ConsultationCase | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'case-info' | 'documents'>('case-info');
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [currentUserName, setCurrentUserName] = useState<string>('');
    const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
    const [message, setMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [mobileView, setMobileView] = useState<'info' | 'chat'>('info');
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadCase();
    }, [caseId]);

    // Check if chat should be available (computed from caseData)
    const chatAvailable = caseData && ['meeting_scheduled', 'meeting_completed', 'recommendations_sent', 'converted'].includes(caseData.status);

    useEffect(() => {
        if (caseData && chatAvailable) {
            loadMessages();
            // Subscribe to real-time message updates (like ChatPanel)
            const unsubscribe = subscribeToMessages();
            return () => {
                if (unsubscribe) unsubscribe();
            };
        }
    }, [caseData, chatAvailable]);

    useEffect(() => {
        // Scroll to bottom when messages change
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Real-time subscription for instant message updates
    const subscribeToMessages = () => {
        const unsubscribe = client.subscribe(
            `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.collections.messages}.documents`,
            (response: any) => {
                if (response.events.includes('databases.*.collections.*.documents.*.create')) {
                    const newMsg = response.payload as Message;
                    if (newMsg.orderId === caseId) {
                        // Only add if message doesn't already exist (prevent duplicates from optimistic updates)
                        setMessages(prev => {
                            const exists = prev.some(m => m.$id === newMsg.$id ||
                                (m.$id.startsWith('temp-') && m.message === newMsg.message && m.senderId === newMsg.senderId));
                            if (exists) {
                                // Replace temp message with real one
                                return prev.map(m =>
                                    (m.$id.startsWith('temp-') && m.message === newMsg.message && m.senderId === newMsg.senderId)
                                        ? newMsg
                                        : m
                                );
                            }
                            return [...prev, newMsg];
                        });
                    }
                }
            }
        );
        return unsubscribe;
    };

    const loadMessages = async () => {
        if (!caseId) return;
        try {
            const response = await fetch(`/api/messages?orderId=${caseId}`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const loadCase = async () => {
        try {
            const userData = await account.get();
            setCurrentUserId(userData.$id);
            setCurrentUserName(userData.name || 'Customer');
            setCurrentUserEmail(userData.email || '');
            const response = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.consultationCases,
                caseId
            );

            const isOwner = response.customerId === userData.$id;
            const isEmailMatch = response.customerEmail === userData.email;

            if (!isOwner && !isEmailMatch) {
                setError('You do not have permission to view this case');
                return;
            }

            setCaseData(response as unknown as ConsultationCase);
        } catch (error: any) {
            console.error('Error loading case:', error);
            if (error?.code === 404 || error?.message?.includes('not found')) {
                setError('Case not found. It may have been deleted or does not exist.');
            } else if (error?.code === 401) {
                setError('Please log in to view this case.');
            } else {
                setError('Failed to load case details. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const isStepCompleted = (stepKey: string) => {
        if (!caseData) return false;
        const step = PROGRESS_STEPS.find(s => s.key === stepKey);
        return step?.statuses.includes(caseData.status) || false;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDateShort = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const handleSendMessage = async () => {
        if (!message.trim() || !caseData || !isChatAvailable || !currentUserId) return;

        const messageText = message.trim();

        // Optimistic update - add message immediately
        const optimisticMessage: Message = {
            $id: `temp-${Date.now()}`,
            orderId: caseId,
            senderId: currentUserId,
            senderName: currentUserName,
            senderRole: 'customer',
            message: messageText,
            attachments: [],
            isConsultation: true,
            $createdAt: new Date().toISOString(),
            $updatedAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setMessage(''); // Clear input immediately
        setSendingMessage(true);

        try {
            // Create message directly using client SDK
            // Real-time subscription will replace the temp message with the real one
            await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.messages,
                ID.unique(),
                {
                    orderId: caseId,
                    senderId: currentUserId,
                    senderName: currentUserName,
                    senderRole: 'customer',
                    message: messageText,
                    messageType: 'text',
                    read: false,
                    readAt: null,
                    metadata: null
                }
            );
            // No need to loadMessages() - real-time subscription handles it
        } catch (err: any) {
            console.error('Failed to send message:', err);
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m.$id !== optimisticMessage.$id));
            setMessage(messageText); // Restore message
            toast.error(err.message || 'Failed to send message');
        } finally {
            setSendingMessage(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !isChatAvailable) return;

        const file = e.target.files[0];

        // Validate file size (10MB max)
        const MAX_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            toast.error('File size must be under 10MB');
            return;
        }

        // Optimistic update - add message immediately
        const optimisticMessage: Message = {
            $id: `temp-file-${Date.now()}`,
            orderId: caseId,
            senderId: currentUserId,
            senderName: currentUserName,
            senderRole: 'customer',
            message: `📎 ${file.name}`,
            attachments: [],
            isConsultation: true,
            $createdAt: new Date().toISOString(),
            $updatedAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setUploadingFile(true);

        try {
            // Upload file using Appwrite client SDK directly
            const uploadedFile = await storage.createFile(
                appwriteConfig.buckets.consultationAttachments,
                ID.unique(),
                file
            );

            // Create message directly using client SDK
            // Real-time subscription will replace the temp message with the real one
            await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.messages,
                ID.unique(),
                {
                    orderId: caseId,
                    senderId: currentUserId,
                    senderName: currentUserName,
                    senderRole: 'customer',
                    message: `📎 ${file.name}`,
                    messageType: 'text',
                    read: false,
                    readAt: null,
                    metadata: JSON.stringify({ attachments: [{ $id: uploadedFile.$id, name: file.name, size: file.size, mimeType: file.type }] })
                }
            );
            // No need to loadMessages() - real-time subscription handles it
        } catch (err: any) {
            console.error('Failed to upload file:', err);
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m.$id !== optimisticMessage.$id));
            toast.error(err.message || 'Failed to upload file');
        } finally {
            setUploadingFile(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Use the already computed chatAvailable
    const isChatAvailable = chatAvailable;

    // Check if recommendations should be shown
    const showRecommendations = caseData && ['meeting_completed', 'recommendations_sent', 'converted', 'closed'].includes(caseData.status);

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-neutral-200 rounded w-32"></div>
                    <div className="h-8 bg-neutral-200 rounded w-48"></div>
                    <div className="grid lg:grid-cols-5 gap-6 mt-6">
                        <div className="lg:col-span-3 h-96 bg-neutral-200 rounded-xl"></div>
                        <div className="lg:col-span-2 h-96 bg-neutral-200 rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !caseData) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <XCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                    <p className="text-red-500 mb-4">{error || 'Case not found'}</p>
                    <Link href="/dashboard/consultations">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Consultations
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const suggestedServices = (caseData.suggestedServiceSlugs || [])
        .map((slug) => getServiceBySlug(slug))
        .filter((service): service is NonNullable<typeof service> => service !== undefined);

    return (
        <div className="h-[calc(100vh-64px)] overflow-hidden flex flex-col">
            {/* Header - Sticky */}
            <div className="flex-shrink-0 px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4 bg-white border-b border-neutral-100">
                <Link
                    href="/dashboard/consultations"
                    className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 mb-2 md:mb-3"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    All Cases
                </Link>
                <h1 className="text-lg md:text-xl font-semibold text-neutral-900 line-clamp-1">
                    #{caseData.caseNumber.split('-').pop()} {caseData.title}
                </h1>
            </div>

            {/* Mobile Tab Switcher */}
            <div className="lg:hidden flex-shrink-0 flex border-b border-neutral-200 bg-white">
                <button
                    onClick={() => setMobileView('info')}
                    className={cn(
                        "flex-1 py-3 text-sm font-medium text-center transition-colors",
                        mobileView === 'info'
                            ? "text-brand-600 border-b-2 border-brand-600"
                            : "text-neutral-500 hover:text-neutral-700"
                    )}
                >
                    Case Info
                </button>
                <button
                    onClick={() => setMobileView('chat')}
                    className={cn(
                        "flex-1 py-3 text-sm font-medium text-center transition-colors",
                        mobileView === 'chat'
                            ? "text-brand-600 border-b-2 border-brand-600"
                            : "text-neutral-500 hover:text-neutral-700"
                    )}
                >
                    Chat
                    {isChatAvailable && messages.length > 0 && (
                        <span className="ml-1.5 px-1.5 py-0.5 bg-brand-100 text-brand-600 text-xs rounded-full">
                            {messages.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Main Content - Two Column Layout */}
            <div className="flex-1 overflow-hidden flex flex-col lg:grid lg:grid-cols-5 gap-0 lg:gap-6 lg:p-6 min-h-0">
                {/* Left Column - Case Info - Scrollable */}
                <div className={cn(
                    "lg:col-span-3 overflow-y-auto space-y-4 md:space-y-6 lg:pr-2 p-4 lg:p-0 min-h-0",
                    mobileView === 'info' ? 'flex-1' : 'hidden lg:block'
                )}>
                    {/* Meeting Details - TOP PRIORITY */}
                    {caseData.scheduledAt ? (
                        <div className="bg-brand-50 rounded-xl border border-brand-100 p-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-brand-900">
                                            {formatDate(caseData.scheduledAt)}
                                        </p>
                                        <p className="text-sm text-brand-700">
                                            30 min consultation
                                        </p>
                                    </div>
                                </div>
                                {caseData.meetingLink && caseData.status === 'meeting_scheduled' && (
                                    <a
                                        href={caseData.meetingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Join Meeting
                                    </a>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-neutral-200 flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-neutral-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-neutral-900">Schedule Your Meeting</p>
                                        <p className="text-sm text-neutral-500">
                                            Book a convenient time slot
                                        </p>
                                    </div>
                                </div>
                                <Link href={`/dashboard/consultations/book/${caseId}`}>
                                    <Button className="bg-brand-600 hover:bg-brand-700">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        Book Slot
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Brief */}
                    <div>
                        <h3 className="text-sm font-medium text-neutral-500 mb-1">Brief</h3>
                        <p className="text-neutral-900">{caseData.description}</p>
                    </div>

                    {/* What Happens Next - Progress */}
                    <div className="bg-white rounded-xl border border-neutral-200 p-6">
                        <h3 className="font-semibold text-neutral-900 mb-6">What Happens Next?</h3>
                        <div className="space-y-1">
                            {PROGRESS_STEPS.map((step, index) => {
                                const StepIcon = step.icon;
                                const isCompleted = isStepCompleted(step.key);
                                const isLast = index === PROGRESS_STEPS.length - 1;

                                return (
                                    <div key={step.key} className="flex items-start">
                                        <div className="flex flex-col items-center mr-4">
                                            <div
                                                className={cn(
                                                    "w-6 h-6 rounded flex items-center justify-center border-2 transition-colors",
                                                    isCompleted
                                                        ? "bg-brand-600 border-brand-600"
                                                        : "bg-white border-neutral-300"
                                                )}
                                            >
                                                {isCompleted && <CheckCircle className="w-4 h-4 text-white" />}
                                            </div>
                                            {!isLast && (
                                                <div
                                                    className={cn(
                                                        "w-0.5 h-8 mt-1",
                                                        isCompleted ? "bg-brand-600" : "bg-neutral-200"
                                                    )}
                                                />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 pb-6">
                                            <StepIcon
                                                className={cn(
                                                    "w-5 h-5",
                                                    isCompleted ? "text-neutral-700" : "text-neutral-400"
                                                )}
                                            />
                                            <span
                                                className={cn(
                                                    "text-sm font-medium",
                                                    isCompleted ? "text-neutral-900" : "text-neutral-400"
                                                )}
                                            >
                                                {step.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recommendations - Only show after meeting completed */}
                    {showRecommendations && (
                        <div className="bg-white rounded-xl border border-neutral-200 p-6">
                            <h3 className="font-semibold text-neutral-900 mb-4">Expert Recommendations</h3>

                            {caseData.recommendations ? (
                                <div className="mb-6 p-4 bg-brand-50 rounded-lg border border-brand-100">
                                    <p className="text-neutral-700 whitespace-pre-wrap text-sm">
                                        {caseData.recommendations}
                                    </p>
                                </div>
                            ) : caseData.status === 'meeting_completed' ? (
                                <div className="mb-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                                    <p className="text-neutral-500 text-sm">
                                        Your expert is preparing recommendations. Check back soon!
                                    </p>
                                </div>
                            ) : null}

                            {suggestedServices.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-neutral-500 mb-3">
                                        Recommended Services
                                    </h4>
                                    <div className="space-y-3">
                                        {suggestedServices.map((service) => (
                                            <div
                                                key={service.slug}
                                                className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors"
                                            >
                                                <div>
                                                    <p className="font-medium text-neutral-900">
                                                        {service.title}
                                                    </p>
                                                    <p className="text-sm text-neutral-500">
                                                        Starting ₹
                                                        {service.packages?.[0]?.price?.toLocaleString() ||
                                                            service.basePrice?.toLocaleString()}
                                                    </p>
                                                </div>
                                                <Link href={`/services/${service.slug}`}>
                                                    <Button size="sm" className="bg-brand-600 hover:bg-brand-700">
                                                        <ShoppingCart className="mr-2 h-3 w-3" />
                                                        View
                                                    </Button>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tabs for additional info */}
                    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                        <div className="flex border-b border-neutral-200">
                            {[
                                { key: 'case-info', label: 'Case Information' },
                                { key: 'documents', label: 'Documents' },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                                    className={cn(
                                        "px-4 py-3 text-sm font-medium transition-colors",
                                        activeTab === tab.key
                                            ? "text-brand-600 border-b-2 border-brand-600 -mb-px"
                                            : "text-neutral-500 hover:text-neutral-700"
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="p-6">
                            {activeTab === 'case-info' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-neutral-500">Business Type</label>
                                        <p className="font-medium text-neutral-900">
                                            {BUSINESS_TYPE_LABELS[caseData.businessType]}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-neutral-500">Category</label>
                                        <p className="font-medium text-neutral-900">
                                            {CASE_TYPE_LABELS[caseData.caseType]}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-neutral-500">Submitted On</label>
                                        <p className="font-medium text-neutral-900">
                                            {formatDateShort(caseData.$createdAt)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-neutral-500">Contact</label>
                                        <p className="font-medium text-neutral-900">{caseData.customerName}</p>
                                        <p className="text-sm text-neutral-500">{caseData.customerEmail}</p>
                                        <p className="text-sm text-neutral-500">{caseData.customerPhone}</p>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'documents' && (
                                <div>
                                    {caseData.attachments && caseData.attachments.length > 0 ? (
                                        <div className="space-y-2">
                                            {caseData.attachments.map((fileId, index) => (
                                                <a
                                                    key={fileId}
                                                    href={`${appwriteConfig.endpoint}/storage/buckets/consultation-attachments/files/${fileId}/view?project=${appwriteConfig.project}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                                                >
                                                    <FileText className="h-5 w-5 text-neutral-400" />
                                                    <span className="flex-1 text-sm font-medium text-neutral-700">
                                                        Attachment {index + 1}
                                                    </span>
                                                    <ExternalLink className="h-4 w-4 text-neutral-400" />
                                                </a>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-neutral-500">
                                            <FileText className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                                            <p className="text-sm">No documents uploaded</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Chat - Fixed height with scroll */}
                <div className={cn(
                    "lg:col-span-2 flex flex-col min-h-0",
                    mobileView === 'chat' ? 'flex-1' : 'hidden lg:flex'
                )}>
                    <div className="bg-white rounded-xl border border-neutral-200 flex flex-col flex-1 min-h-0 m-4 lg:m-0 max-h-[calc(100vh-200px)] lg:max-h-full">
                        {/* Chat Header */}
                        <div className="flex-shrink-0 px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
                            <h3 className="font-semibold text-neutral-900">Chat</h3>
                            <div className="flex items-center gap-1 text-xs text-neutral-500">
                                <Users className="w-3 h-3" />
                                <span>with Expert</span>
                            </div>
                        </div>

                        {/* Chat Body - Scrollable */}
                        <div
                            ref={chatContainerRef}
                            className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0"
                        >
                            {!isChatAvailable ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <MessageSquare className="w-10 h-10 mx-auto mb-3 text-neutral-300" />
                                    <h4 className="font-medium text-neutral-900 mb-1">Chat & Support</h4>
                                    <p className="text-sm text-neutral-500 max-w-[200px] mx-auto">
                                        Chat will be available once your meeting is scheduled
                                    </p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <MessageSquare className="w-10 h-10 mx-auto mb-3 text-neutral-300" />
                                    <h4 className="font-medium text-neutral-900 mb-1">Chat with Expert</h4>
                                    <p className="text-sm text-neutral-500">
                                        Start a conversation
                                    </p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isOwn = msg.senderId === currentUserId;
                                    const msgTime = new Date(msg.$createdAt).toLocaleTimeString('en-IN', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true,
                                    });

                                    // Parse attachments from metadata (same as ChatPanel)
                                    let attachments: string[] = [];
                                    if (msg.metadata) {
                                        try {
                                            const metadata = JSON.parse(msg.metadata);
                                            attachments = (metadata.attachments || []).map((a: any) => typeof a === 'string' ? a : a.$id);
                                        } catch (e) {
                                            console.error('Failed to parse attachments:', e);
                                        }
                                    }

                                    return (
                                        <div
                                            key={msg.$id}
                                            className={cn(
                                                'flex',
                                                isOwn ? 'justify-end' : 'justify-start'
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'max-w-[75%] rounded-2xl px-4 py-2.5',
                                                    isOwn
                                                        ? 'bg-brand-600 text-white rounded-br-md'
                                                        : 'bg-neutral-100 text-neutral-900 rounded-bl-md'
                                                )}
                                            >
                                                <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                                                {attachments.length > 0 && (
                                                    <div className="mt-2 space-y-1">
                                                        {attachments.map((fileId, idx) => (
                                                            <a
                                                                key={idx}
                                                                href={`${appwriteConfig.endpoint}/storage/buckets/consultation-attachments/files/${fileId}/view?project=${appwriteConfig.project}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={cn(
                                                                    'flex items-center gap-2 text-xs underline',
                                                                    isOwn ? 'text-white/90' : 'text-brand-600'
                                                                )}
                                                            >
                                                                <Download className="w-3 h-3" />
                                                                Attachment {idx + 1}
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                                <p className={cn(
                                                    'text-[10px] mt-1',
                                                    isOwn ? 'text-white/70' : 'text-neutral-400'
                                                )}>
                                                    {msgTime}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Chat Input */}
                        <div className="flex-shrink-0 p-4 border-t border-neutral-200 bg-neutral-50">
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={!isChatAvailable || uploadingFile}
                                    className={cn(
                                        "p-2.5 rounded-lg transition-colors",
                                        isChatAvailable && !uploadingFile
                                            ? "hover:bg-neutral-200 text-neutral-500"
                                            : "bg-neutral-100 text-neutral-300 cursor-not-allowed"
                                    )}
                                >
                                    {uploadingFile ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Paperclip className="w-4 h-4" />
                                    )}
                                </button>
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder={isChatAvailable ? "Type a message..." : "Chat available after meeting scheduled"}
                                    disabled={!isChatAvailable || sendingMessage}
                                    className={cn(
                                        "flex-1 px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
                                        (!isChatAvailable || sendingMessage) && "bg-neutral-100 cursor-not-allowed"
                                    )}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!isChatAvailable || !message.trim() || sendingMessage}
                                    className={cn(
                                        'p-2.5 rounded-lg transition-colors',
                                        isChatAvailable && message.trim() && !sendingMessage
                                            ? 'bg-brand-600 text-white hover:bg-brand-700'
                                            : 'bg-neutral-200 text-neutral-400'
                                    )}
                                >
                                    {sendingMessage ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

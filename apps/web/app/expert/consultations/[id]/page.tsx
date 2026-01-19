'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { databases, account, storage, client } from '@lawethic/appwrite/client';
import { appwriteConfig } from '@lawethic/appwrite/config';
import { Query, ID } from 'appwrite';
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
    Edit3,
    XCircle,
    Mail,
    Phone,
    User,
    Loader2,
    Video,
    UserX,
    Sparkles,
    X,
    Download,
    Building2,
    Briefcase,
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
import { getAllServices } from '@/data/services';

function ExpertConsultationDetailContent() {
    const params = useParams();
    const caseId = params.id as string;

    const [caseData, setCaseData] = useState<ConsultationCase | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal states
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [showRecommendModal, setShowRecommendModal] = useState(false);

    // Form states
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [internalNotes, setInternalNotes] = useState('');
    const [recommendations, setRecommendations] = useState('');
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [savingNotes, setSavingNotes] = useState(false);
    const [sendingRecommendations, setSendingRecommendations] = useState(false);

    // Chat states
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [currentUserName, setCurrentUserName] = useState<string>('');
    const [currentUserRole, setCurrentUserRole] = useState<string>('expert');
    const [message, setMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [mobileView, setMobileView] = useState<'info' | 'chat'>('info');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const allServices = getAllServices();

    useEffect(() => {
        loadCase();
        loadCurrentUser();
    }, [caseId]);

    useEffect(() => {
        if (caseData) {
            loadMessages();
            const unsubscribe = subscribeToMessages();
            return () => {
                if (unsubscribe) unsubscribe();
            };
        }
    }, [caseData]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const subscribeToMessages = () => {
        const unsubscribe = client.subscribe(
            `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.collections.messages}.documents`,
            (response: any) => {
                if (response.events.includes('databases.*.collections.*.documents.*.create')) {
                    const newMsg = response.payload as Message;
                    if (newMsg.orderId === caseId) {
                        setMessages(prev => {
                            const exists = prev.some(m => m.$id === newMsg.$id ||
                                (m.$id.startsWith('temp-') && m.message === newMsg.message && m.senderId === newMsg.senderId));
                            if (exists) {
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

    const loadCurrentUser = async () => {
        try {
            const user = await account.get();
            setCurrentUserId(user.$id);
            setCurrentUserName(user.name || 'Expert');
            setCurrentUserRole((user.prefs?.role as string) || 'expert');
        } catch (error) {
            console.error('Error loading user:', error);
        }
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
            const response = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.consultationCases,
                caseId
            );
            const data = response as unknown as ConsultationCase;
            setCaseData(data);
            setInternalNotes(data.expertNotes || '');
            setRecommendations(data.recommendations || '');
            setSelectedServices(data.suggestedServiceSlugs || []);
        } catch (error: any) {
            console.error('Error loading case:', error);
            setError('Failed to load case details');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const canMarkMeetingStatus = () => {
        if (!caseData?.scheduledAt) return false;
        const meetingTime = new Date(caseData.scheduledAt);
        const bufferTime = new Date(meetingTime.getTime() + 30 * 60 * 1000);
        return new Date() >= bufferTime;
    };

    const canShowRecommendations = () => {
        if (!caseData) return false;
        return ['meeting_completed', 'recommendations_sent', 'converted', 'closed'].includes(caseData.status);
    };

    const handleUpdateStatus = async (newStatus: ConsultationStatus) => {
        if (!caseData) return;
        setUpdatingStatus(true);

        try {
            const response = await fetch('/api/consultations/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ caseId, status: newStatus }),
            });

            if (!response.ok) throw new Error('Failed to update status');

            setCaseData({ ...caseData, status: newStatus });
            toast.success('Status updated');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleMarkComplete = async () => {
        await handleUpdateStatus('meeting_completed');
    };

    const handleMarkNoShow = async () => {
        await handleUpdateStatus('closed');
        toast.success('Marked as no-show and closed');
    };

    const handleSaveNotes = async () => {
        if (!caseData) return;
        setSavingNotes(true);

        try {
            await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.consultationCases,
                caseId,
                { expertNotes: internalNotes }
            );
            setCaseData({ ...caseData, expertNotes: internalNotes });
            setShowNotesModal(false);
            toast.success('Notes saved');
        } catch (error) {
            console.error('Error saving notes:', error);
            toast.error('Failed to save notes');
        } finally {
            setSavingNotes(false);
        }
    };

    const handleSendRecommendations = async () => {
        if (!caseData) return;
        setSendingRecommendations(true);

        try {
            const response = await fetch('/api/consultations/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    caseId,
                    recommendations,
                    suggestedServiceSlugs: selectedServices,
                }),
            });

            if (!response.ok) throw new Error('Failed to send recommendations');

            setCaseData({
                ...caseData,
                recommendations,
                suggestedServiceSlugs: selectedServices,
                status: 'recommendations_sent',
            });
            setShowRecommendModal(false);
            toast.success('Recommendations sent to customer');
        } catch (error) {
            console.error('Error sending recommendations:', error);
            toast.error('Failed to send recommendations');
        } finally {
            setSendingRecommendations(false);
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim() || !caseData || !currentUserId) return;

        const messageText = message.trim();

        const optimisticMessage: Message = {
            $id: `temp-${Date.now()}`,
            orderId: caseId,
            senderId: currentUserId,
            senderName: currentUserName,
            senderRole: currentUserRole,
            message: messageText,
            attachments: [],
            isConsultation: true,
            $createdAt: new Date().toISOString(),
            $updatedAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setMessage('');
        setSendingMessage(true);

        try {
            await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.messages,
                ID.unique(),
                {
                    orderId: caseId,
                    senderId: currentUserId,
                    senderName: currentUserName,
                    senderRole: currentUserRole,
                    message: messageText,
                    messageType: 'text',
                    read: false,
                    readAt: null,
                    metadata: null
                }
            );
        } catch (err: any) {
            console.error('Failed to send message:', err);
            setMessages(prev => prev.filter(m => m.$id !== optimisticMessage.$id));
            setMessage(messageText);
            toast.error('Failed to send message');
        } finally {
            setSendingMessage(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;

        const file = e.target.files[0];
        const MAX_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            toast.error('File size must be under 10MB');
            return;
        }

        const optimisticMessage: Message = {
            $id: `temp-file-${Date.now()}`,
            orderId: caseId,
            senderId: currentUserId,
            senderName: currentUserName,
            senderRole: currentUserRole,
            message: `📎 ${file.name}`,
            attachments: [],
            isConsultation: true,
            $createdAt: new Date().toISOString(),
            $updatedAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setUploadingFile(true);

        try {
            const uploadedFile = await storage.createFile(
                appwriteConfig.buckets.consultationAttachments,
                ID.unique(),
                file
            );

            await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.messages,
                ID.unique(),
                {
                    orderId: caseId,
                    senderId: currentUserId,
                    senderName: currentUserName,
                    senderRole: currentUserRole,
                    message: `📎 ${file.name}`,
                    messageType: 'text',
                    read: false,
                    readAt: null,
                    metadata: JSON.stringify({ attachments: [{ $id: uploadedFile.$id, name: file.name, size: file.size, mimeType: file.type }] })
                }
            );
        } catch (err: any) {
            console.error('Failed to upload file:', err);
            setMessages(prev => prev.filter(m => m.$id !== optimisticMessage.$id));
            toast.error('Failed to upload file');
        } finally {
            setUploadingFile(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const toggleService = (slug: string) => {
        setSelectedServices(prev =>
            prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
        );
    };

    const getStatusColor = (status: ConsultationStatus) => {
        const colors: Record<ConsultationStatus, string> = {
            submitted: 'bg-gray-100 text-gray-700',
            under_review: 'bg-blue-50 text-blue-700',
            pending_assignment: 'bg-orange-50 text-orange-700',
            meeting_scheduled: 'bg-purple-50 text-purple-700',
            meeting_completed: 'bg-green-50 text-green-700',
            recommendations_sent: 'bg-amber-50 text-amber-700',
            converted: 'bg-emerald-50 text-emerald-700',
            cancelled: 'bg-red-50 text-red-600',
            closed: 'bg-neutral-100 text-neutral-600',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getStatusLabel = (status: ConsultationStatus) => {
        const labels: Record<ConsultationStatus, string> = {
            submitted: 'Submitted',
            under_review: 'Under Review',
            pending_assignment: 'Pending Assignment',
            meeting_scheduled: 'Meeting Scheduled',
            meeting_completed: 'Meeting Completed',
            recommendations_sent: 'Recommendations Sent',
            converted: 'Converted',
            cancelled: 'Cancelled',
            closed: 'Closed',
        };
        return labels[status] || status;
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-64px)] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (error || !caseData) {
        return (
            <div className="h-[calc(100vh-64px)] flex items-center justify-center">
                <div className="text-center">
                    <XCircle className="w-10 h-10 mx-auto mb-3 text-red-400" />
                    <p className="text-neutral-600 mb-4">{error || 'Case not found'}</p>
                    <Link href="/expert/consultations">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col bg-neutral-50">
            {/* Header */}
            <div className="flex-shrink-0 bg-white border-b border-neutral-200">
                <div className="px-4 md:px-6 py-3 md:py-4">
                    <div className="flex items-center justify-between gap-2">
                        {/* Left: Back + Case Info */}
                        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
                            <Link
                                href="/expert/consultations"
                                className="p-1.5 -ml-1.5 rounded-lg hover:bg-neutral-100 transition-colors flex-shrink-0"
                            >
                                <ArrowLeft className="h-5 w-5 text-neutral-500" />
                            </Link>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-base md:text-lg font-semibold text-neutral-900 truncate">
                                        {caseData.caseNumber}
                                    </h1>
                                    <span className={cn(
                                        'px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0',
                                        getStatusColor(caseData.status)
                                    )}>
                                        {getStatusLabel(caseData.status)}
                                    </span>
                                </div>
                                <p className="text-sm text-neutral-500 truncate">{caseData.title}</p>
                            </div>
                        </div>

                        {/* Center: Customer Info (compact) - Hidden on mobile */}
                        <div className="hidden lg:flex items-center gap-6 px-6 py-2 bg-neutral-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-neutral-400" />
                                <span className="text-sm font-medium text-neutral-700">{caseData.customerName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-neutral-400" />
                                <span className="text-sm text-neutral-600">{caseData.customerEmail}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-neutral-400" />
                                <span className="text-sm text-neutral-600">{caseData.customerPhone}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Tab Switcher */}
            <div className="lg:hidden flex-shrink-0 flex border-b border-neutral-200 bg-white">
                <button
                    onClick={() => setMobileView('info')}
                    className={cn(
                        "flex-1 py-3 text-sm font-medium text-center transition-colors",
                        mobileView === 'info'
                            ? "text-emerald-600 border-b-2 border-emerald-600"
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
                            ? "text-emerald-600 border-b-2 border-emerald-600"
                            : "text-neutral-500 hover:text-neutral-700"
                    )}
                >
                    Chat
                    {messages.length > 0 && (
                        <span className="ml-1.5 px-1.5 py-0.5 bg-emerald-100 text-emerald-600 text-xs rounded-full">
                            {messages.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden flex flex-col lg:grid lg:grid-cols-5 gap-0">
                {/* Left Column - Content */}
                <div className={cn(
                    "lg:col-span-3 overflow-y-auto lg:border-r border-neutral-200 bg-white",
                    mobileView === 'info' ? 'flex-1' : 'hidden lg:block'
                )}>
                    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                        {/* Mobile: Customer Info Card */}
                        <div className="lg:hidden bg-neutral-50 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <User className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-neutral-900 truncate">{caseData.customerName}</p>
                                    <p className="text-sm text-neutral-500 truncate">{caseData.customerEmail}</p>
                                    <p className="text-sm text-neutral-500">{caseData.customerPhone}</p>
                                </div>
                            </div>
                        </div>

                        {/* Meeting Details - Top Priority */}
                        <div className="bg-emerald-50/50 rounded-xl p-4 md:p-5 border border-emerald-100">
                            <h3 className="text-sm font-medium text-neutral-900 mb-4 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-emerald-600" />
                                Meeting
                            </h3>
                            {caseData.scheduledAt ? (
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1">
                                            <p className="text-sm text-neutral-500">Date & Time</p>
                                            <p className="font-medium text-neutral-900">
                                                {formatDate(caseData.scheduledAt)} at {formatTime(caseData.scheduledAt)}
                                            </p>
                                        </div>
                                        {caseData.meetingLink && (
                                            <a
                                                href={caseData.meetingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                                            >
                                                <Video className="w-4 h-4" />
                                                Join Meeting
                                            </a>
                                        )}
                                    </div>

                                    {/* Complete/No Show Buttons */}
                                    {caseData.status === 'meeting_scheduled' && (
                                        <div className="pt-4 border-t border-emerald-200/50">
                                            {canMarkMeetingStatus() ? (
                                                <div className="flex gap-3">
                                                    <Button
                                                        onClick={handleMarkComplete}
                                                        disabled={updatingStatus}
                                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                                        size="sm"
                                                    >
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Mark Complete
                                                    </Button>
                                                    <Button
                                                        onClick={handleMarkNoShow}
                                                        disabled={updatingStatus}
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                                    >
                                                        <UserX className="mr-2 h-4 w-4" />
                                                        No Show
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                                                    <Clock className="w-4 h-4" />
                                                    <span>You can mark complete or no-show after the meeting ends</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <Clock className="h-8 w-8 mx-auto mb-2 text-neutral-300" />
                                    <p className="text-sm text-neutral-500">Awaiting customer to schedule</p>
                                </div>
                            )}
                        </div>

                        {/* Case Details */}
                        <div>
                            <h3 className="text-sm font-medium text-neutral-900 mb-4 flex items-center gap-2">
                                <Briefcase className="w-4 h-4" />
                                Case Details
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-neutral-50 rounded-lg p-3">
                                    <p className="text-neutral-500 flex items-center gap-1.5">
                                        <Building2 className="w-3.5 h-3.5" />
                                        Business Type
                                    </p>
                                    <p className="font-medium text-neutral-900 mt-0.5">
                                        {BUSINESS_TYPE_LABELS[caseData.businessType]}
                                    </p>
                                </div>
                                <div className="bg-neutral-50 rounded-lg p-3">
                                    <p className="text-neutral-500">Case Type</p>
                                    <p className="font-medium text-neutral-900 mt-0.5">
                                        {CASE_TYPE_LABELS[caseData.caseType]}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-neutral-500 text-sm">Description</p>
                                <p className="text-neutral-700 text-sm mt-1 leading-relaxed bg-neutral-50 rounded-lg p-3">
                                    {caseData.description}
                                </p>
                            </div>
                            {caseData.attachments && caseData.attachments.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-neutral-500 text-sm mb-2">Customer Attachments</p>
                                    <div className="flex flex-wrap gap-2">
                                        {caseData.attachments.map((fileId, index) => (
                                            <a
                                                key={fileId}
                                                href={`${appwriteConfig.endpoint}/storage/buckets/consultation-attachments/files/${fileId}/view?project=${appwriteConfig.project}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 rounded-lg hover:bg-neutral-200 text-sm transition-colors"
                                            >
                                                <FileText className="h-3.5 w-3.5 text-neutral-500" />
                                                <span>File {index + 1}</span>
                                                <ExternalLink className="h-3 w-3 text-neutral-400" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Expert Notes */}
                        <div className="pt-6 border-t border-neutral-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-neutral-900">Your Notes</h3>
                                <button
                                    onClick={() => setShowNotesModal(true)}
                                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    Edit
                                </button>
                            </div>
                            <div className="bg-neutral-50 rounded-lg p-4">
                                <p className="text-sm text-neutral-600 whitespace-pre-wrap">
                                    {caseData.expertNotes || 'No notes added yet. Click Edit to add private notes about this case.'}
                                </p>
                            </div>
                        </div>

                        {/* Recommendations - Only after meeting completed */}
                        {canShowRecommendations() && (
                            <div className="pt-6 border-t border-neutral-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-neutral-900 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-emerald-600" />
                                        Recommendations
                                    </h3>
                                    <button
                                        onClick={() => setShowRecommendModal(true)}
                                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                                    >
                                        {caseData.recommendations ? 'Edit' : 'Add Recommendations'}
                                    </button>
                                </div>
                                {(caseData.recommendations || (caseData.suggestedServiceSlugs && caseData.suggestedServiceSlugs.length > 0)) ? (
                                    <div className="space-y-4">
                                        {caseData.recommendations && (
                                            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                                                <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                                                    {caseData.recommendations}
                                                </p>
                                            </div>
                                        )}
                                        {caseData.suggestedServiceSlugs && caseData.suggestedServiceSlugs.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-xs text-neutral-500 uppercase tracking-wide">Suggested Services</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {caseData.suggestedServiceSlugs.map((slug) => {
                                                        const service = allServices.find(s => s.slug === slug);
                                                        return service ? (
                                                            <span
                                                                key={slug}
                                                                className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-sm"
                                                            >
                                                                {service.title}
                                                            </span>
                                                        ) : null;
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-neutral-50 rounded-lg p-4 text-center">
                                        <p className="text-sm text-neutral-500">
                                            Meeting completed! Click "Add Recommendations" to share your advice with the customer.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Chat */}
                <div className={cn(
                    "lg:col-span-2 flex flex-col bg-white overflow-hidden",
                    mobileView === 'chat' ? 'flex-1' : 'hidden lg:flex'
                )}>
                    {/* Chat Header */}
                    <div className="flex-shrink-0 px-4 md:px-5 py-3 md:py-4 border-b border-neutral-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-emerald-500" />
                                <h3 className="font-medium text-neutral-900">Chat with Customer</h3>
                            </div>
                            <span className="text-xs text-neutral-400">{caseData.customerName}</span>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto p-5 space-y-4"
                    >
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                                    <MessageSquare className="w-5 h-5 text-neutral-400" />
                                </div>
                                <p className="text-sm text-neutral-500">No messages yet</p>
                                <p className="text-xs text-neutral-400 mt-1">Start the conversation with your customer</p>
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isOwn = msg.senderId === currentUserId;
                                const msgTime = new Date(msg.$createdAt).toLocaleTimeString('en-IN', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true,
                                });

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
                                                    ? 'bg-emerald-600 text-white rounded-br-md'
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
                                                                isOwn ? 'text-white/90' : 'text-emerald-600'
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
                                disabled={uploadingFile}
                                className="p-2.5 rounded-lg hover:bg-neutral-200 text-neutral-500 transition-colors"
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
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!message.trim() || sendingMessage}
                                className={cn(
                                    'p-2.5 rounded-lg transition-colors',
                                    message.trim() && !sendingMessage
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
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

            {/* Notes Modal */}
            {showNotesModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-lg">
                        <div className="flex items-center justify-between p-4 border-b border-neutral-100">
                            <h3 className="font-semibold text-neutral-900">Edit Notes</h3>
                            <button
                                onClick={() => setShowNotesModal(false)}
                                className="p-1 hover:bg-neutral-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-neutral-500" />
                            </button>
                        </div>
                        <div className="p-4">
                            <label className="text-sm font-medium text-neutral-700 mb-2 block">
                                Private Notes
                            </label>
                            <p className="text-xs text-neutral-500 mb-3">
                                These notes are only visible to you and the admin team, not to the customer.
                            </p>
                            <textarea
                                value={internalNotes}
                                onChange={(e) => setInternalNotes(e.target.value)}
                                rows={6}
                                className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                placeholder="Add your notes about this case..."
                            />
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t border-neutral-100">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowNotesModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveNotes}
                                disabled={savingNotes}
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                {savingNotes && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                Save Notes
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendations Modal */}
            {showRecommendModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-neutral-100">
                            <h3 className="font-semibold text-neutral-900">Send Recommendations</h3>
                            <button
                                onClick={() => setShowRecommendModal(false)}
                                className="p-1 hover:bg-neutral-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-neutral-500" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-neutral-700 mb-2 block">
                                    Your Recommendations
                                </label>
                                <p className="text-xs text-neutral-500 mb-2">
                                    This will be shared with the customer via email and in their dashboard.
                                </p>
                                <textarea
                                    value={recommendations}
                                    onChange={(e) => setRecommendations(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                    placeholder="Write your professional recommendations for the customer..."
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-neutral-700 mb-2 block">
                                    Suggest Services ({selectedServices.length} selected)
                                </label>
                                <p className="text-xs text-neutral-500 mb-2">
                                    Select services that may help the customer with their legal needs.
                                </p>
                                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                                    {allServices.slice(0, 30).map((service) => (
                                        <button
                                            key={service.slug}
                                            onClick={() => toggleService(service.slug)}
                                            className={cn(
                                                'p-2.5 rounded-lg text-left text-sm transition-all',
                                                selectedServices.includes(service.slug)
                                                    ? 'bg-emerald-50 border-2 border-emerald-600'
                                                    : 'bg-neutral-50 hover:bg-neutral-100 border-2 border-transparent'
                                            )}
                                        >
                                            <span className="line-clamp-1">{service.title}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t border-neutral-100">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowRecommendModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSendRecommendations}
                                disabled={sendingRecommendations || (!recommendations && selectedServices.length === 0)}
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                {sendingRecommendations && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                Send to Customer
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ExpertConsultationDetailPage() {
    return <ExpertConsultationDetailContent />;
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Paperclip, FileText, Image as ImageIcon, Download, XCircle } from 'lucide-react';
import { client, databases, account, storage } from '@lawethic/appwrite';
import { ID } from 'appwrite';

const DATABASE_ID = 'main';
const MESSAGES_COLLECTION = 'messages';
const MESSAGE_ATTACHMENTS_BUCKET = 'message-attachments';

interface Message {
    $id: string;
    orderId: string;
    senderId: string;
    senderName: string;
    senderRole: 'customer' | 'admin' | 'operations' | 'system';
    message: string;
    messageType: 'text' | 'system' | 'file';
    read: boolean;
    readAt: string | null;
    metadata: string | null;
    $createdAt: string;
}

interface FileAttachment {
    $id: string;
    name: string;
    size: number;
    mimeType: string;
}

interface ChatPanelProps {
    orderId: string;
    orderNumber: string;
    onClose: () => void;
}

export default function ChatPanel({ orderId, orderNumber, onClose }: ChatPanelProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load messages
    useEffect(() => {
        loadMessages();
        subscribeToMessages();
    }, [orderId]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/messages?orderId=${orderId}`, {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success) {
                setMessages(data.messages);
                // Mark messages as read
                markMessagesAsRead(data.messages);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const subscribeToMessages = () => {
        // Subscribe to real-time updates
        const unsubscribe = client.subscribe(
            `databases.main.collections.messages.documents`,
            (response: any) => {
                if (response.events.includes('databases.*.collections.*.documents.*.create')) {
                    const newMsg = response.payload as Message;
                    if (newMsg.orderId === orderId) {
                        // Only add if message doesn't already exist (prevent duplicates)
                        setMessages(prev => {
                            const exists = prev.some(m => m.$id === newMsg.$id);
                            if (exists) return prev;
                            return [...prev, newMsg];
                        });
                        // Mark as read if it's from someone else
                        if (newMsg.senderId !== localStorage.getItem('userId')) {
                            markMessagesAsRead([newMsg]);
                        }
                    }
                }
            }
        );

        return () => {
            unsubscribe();
        };
    };

    const markMessagesAsRead = async (msgs: Message[]) => {
        const unreadIds = msgs
            .filter(m => !m.read && m.senderId !== localStorage.getItem('userId'))
            .map(m => m.$id);

        if (unreadIds.length > 0) {
            try {
                await fetch('/api/messages/mark-read', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ messageIds: unreadIds })
                });
            } catch (error) {
                console.error('Error marking messages as read:', error);
            }
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter(file => {
            const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
            const isValidType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type);
            return isValidSize && isValidType;
        });

        if (validFiles.length < files.length) {
            alert('Some files were skipped. Only PDF, DOC, DOCX, JPG, PNG files under 10MB are allowed.');
        }

        setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 3)); // Max 3 files
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if ((!newMessage.trim() && selectedFiles.length === 0) || sending) return;

        const messageText = newMessage.trim();
        let attachments: FileAttachment[] = [];

        try {
            setSending(true);
            setUploading(true);

            // Upload files if any using Appwrite client SDK
            if (selectedFiles.length > 0) {
                for (const file of selectedFiles) {
                    // Validate file
                    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
                    if (file.size > MAX_SIZE) {
                        throw new Error(`File ${file.name} exceeds 10MB limit`);
                    }

                    try {
                        const uploadedFile = await storage.createFile(
                            MESSAGE_ATTACHMENTS_BUCKET,
                            ID.unique(),
                            file
                        );

                        attachments.push({
                            $id: uploadedFile.$id,
                            name: uploadedFile.name,
                            size: uploadedFile.sizeOriginal,
                            mimeType: uploadedFile.mimeType
                        });
                    } catch (uploadError: any) {
                        console.error('File upload error:', uploadError);
                        throw new Error(`Failed to upload ${file.name}`);
                    }
                }
            }

            setUploading(false);

            // Get current user
            const user = await account.get();
            const userRole = (user.prefs?.role as string) || 'customer';

            // Create message directly using client SDK
            await databases.createDocument(
                DATABASE_ID,
                MESSAGES_COLLECTION,
                ID.unique(),
                {
                    orderId,
                    senderId: user.$id,
                    senderName: user.name || 'User',
                    senderRole: userRole,
                    message: messageText || '',
                    messageType: 'text',
                    read: false,
                    readAt: null,
                    metadata: attachments.length > 0 ? JSON.stringify({ attachments }) : null
                }
            );

            setNewMessage('');
            setSelectedFiles([]);

            // Message will be added via real-time subscription
        } catch (error) {
            console.error('Error sending message:', error);
            alert(error instanceof Error ? error.message : 'Failed to send message');
        } finally {
            setSending(false);
            setUploading(false);
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
        return <FileText className="h-4 w-4" />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const downloadFile = async (fileId: string, fileName: string) => {
        const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '';
        const downloadUrl = `${endpoint}/storage/buckets/message-attachments/files/${fileId}/download?project=${projectId}`;

        window.open(downloadUrl, '_blank');
    };

    return (
        <div className="fixed right-4 bottom-20 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                <div>
                    <h3 className="font-semibold">Order Chat</h3>
                    <p className="text-xs text-blue-100">{orderNumber}</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Messages */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
            >
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <MessageCircle className="h-12 w-12 mb-2 text-gray-400" />
                        <p className="text-sm">No messages yet</p>
                        <p className="text-xs text-gray-400 mt-1">Start a conversation</p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg) => {
                            const isOwnMessage = msg.senderRole === 'customer';
                            const isSystem = msg.messageType === 'system';
                            const hasAttachments = msg.metadata !== null && msg.metadata !== '';
                            let attachments: FileAttachment[] = [];

                            if (hasAttachments) {
                                try {
                                    const metadata = JSON.parse(msg.metadata || '{}');
                                    attachments = metadata.attachments || [];
                                } catch (e) {
                                    console.error('Failed to parse attachments:', e);
                                }
                            }

                            if (isSystem) {
                                return (
                                    <div key={msg.$id} className="flex justify-center">
                                        <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                                            {msg.message}
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={msg.$id}
                                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[75%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                                        <div
                                            className={`rounded-lg px-4 py-2 ${isOwnMessage
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-800 border border-gray-200'
                                                }`}
                                        >
                                            {!isOwnMessage && (
                                                <p className="text-xs font-semibold mb-1 text-blue-600">
                                                    {msg.senderName}
                                                </p>
                                            )}
                                            {msg.message && (
                                                <p className="text-sm whitespace-pre-wrap break-words">
                                                    {msg.message}
                                                </p>
                                            )}
                                            {attachments.length > 0 && (
                                                <div className={`space-y-2 ${msg.message ? 'mt-2' : ''}`}>
                                                    {attachments.map((file, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`flex items-center gap-2 p-2 rounded ${isOwnMessage ? 'bg-blue-700' : 'bg-gray-50'
                                                                }`}
                                                        >
                                                            {getFileIcon(file.mimeType)}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium truncate">
                                                                    {file.name}
                                                                </p>
                                                                <p className={`text-xs ${isOwnMessage ? 'text-blue-200' : 'text-gray-500'}`}>
                                                                    {formatFileSize(file.size)}
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={() => downloadFile(file.$id, file.name)}
                                                                className={`p-1 rounded hover:bg-opacity-80 ${isOwnMessage ? 'hover:bg-blue-800' : 'hover:bg-gray-200'
                                                                    }`}
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <p
                                            className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'
                                                }`}
                                        >
                                            {formatTimestamp(msg.$createdAt)}
                                            {isOwnMessage && msg.read && (
                                                <span className="ml-1 text-blue-600">✓</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
                {/* File Preview */}
                {selectedFiles.length > 0 && (
                    <div className="mb-2 space-y-1">
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded text-sm">
                                {file.type.startsWith('image/') ? <ImageIcon className="h-4 w-4 text-gray-600" /> : <FileText className="h-4 w-4 text-gray-600" />}
                                <span className="flex-1 truncate text-gray-700">{file.name}</span>
                                <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="text-gray-400 hover:text-red-600"
                                >
                                    <XCircle className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        multiple
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={sending || selectedFiles.length >= 3}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Attach files (max 3)"
                    >
                        <Paperclip className="h-5 w-5" />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={(!newMessage.trim() && selectedFiles.length === 0) || sending}
                        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {sending ? (
                            uploading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            )
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

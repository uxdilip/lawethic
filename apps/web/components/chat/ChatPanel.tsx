'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { client, databases, account } from '@lawethic/appwrite';
import { ID } from 'appwrite';

const DATABASE_ID = 'main';
const MESSAGES_COLLECTION = 'messages';

interface Message {
    $id: string;
    orderId: string;
    senderId: string;
    senderName: string;
    senderRole: 'customer' | 'admin' | 'operations' | 'system';
    message: string;
    messageType: 'text' | 'system';
    read: boolean;
    readAt: string | null;
    $createdAt: string;
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
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

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

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || sending) return;

        try {
            setSending(true);

            // Get current user
            const user = await account.get();
            const userRole = (user.prefs?.role as string) || 'customer';

            // Create message directly using client SDK
            const response = await databases.createDocument(
                DATABASE_ID,
                MESSAGES_COLLECTION,
                ID.unique(),
                {
                    orderId,
                    senderId: user.$id,
                    senderName: user.name || 'User',
                    senderRole: userRole,
                    message: newMessage.trim(),
                    messageType: 'text',
                    read: false,
                    readAt: null
                }
            );

            setNewMessage('');
            // Message will be added via real-time subscription
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    }; const formatTimestamp = (timestamp: string) => {
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
                                            <p className="text-sm whitespace-pre-wrap break-words">
                                                {msg.message}
                                            </p>
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
                <div className="flex gap-2">
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
                        disabled={!newMessage.trim() || sending}
                        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {sending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

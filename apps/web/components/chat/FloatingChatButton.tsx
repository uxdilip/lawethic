'use client';

import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import ChatPanel from './ChatPanel';

interface FloatingChatButtonProps {
    orderId: string;
    orderNumber: string;
}

export default function FloatingChatButton({ orderId, orderNumber }: FloatingChatButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        loadUnreadCount();

        // Poll for unread count every 30 seconds
        const interval = setInterval(loadUnreadCount, 30000);

        return () => clearInterval(interval);
    }, [orderId]);

    const loadUnreadCount = async () => {
        try {
            const response = await fetch(`/api/messages/unread-count?orderId=${orderId}`, {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success) {
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error('Error loading unread count:', error);
        }
    };

    const handleOpen = () => {
        setIsOpen(true);
        setUnreadCount(0); // Reset count when opening
    };

    return (
        <>
            {!isOpen && (
                <button
                    onClick={handleOpen}
                    className="fixed right-6 bottom-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-40"
                >
                    <MessageCircle className="h-6 w-6" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            )}

            {isOpen && (
                <ChatPanel
                    orderId={orderId}
                    orderNumber={orderNumber}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    );
}

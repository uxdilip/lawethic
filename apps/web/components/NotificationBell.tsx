'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { client } from '@lawethic/appwrite';
import { NotificationItem } from '@/lib/notifications/types';
import NotificationDropdown from './NotificationDropdown';

export default function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    // Get current user ID
    useEffect(() => {
        const getUserId = async () => {
            try {
                const user = await (await import('@lawethic/appwrite')).account.get();
                setUserId(user.$id);
            } catch (error) {
                console.error('Error getting user:', error);
            }
        };
        getUserId();
    }, []);

    // Load notifications
    useEffect(() => {
        if (!userId) return;

        loadNotifications();

        // Set up real-time subscription
        const unsubscribe = subscribeToNotifications();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [userId]);

    const loadNotifications = async () => {
        if (!userId) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/notifications?userId=${userId}&limit=10`);
            const data = await response.json();

            if (data.success) {
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const subscribeToNotifications = () => {
        if (!userId) return;

        const unsubscribe = client.subscribe(
            `databases.main.collections.notifications.documents`,
            (response: any) => {
                if (response.events.includes('databases.*.collections.*.documents.*.create')) {
                    const newNotification = response.payload as NotificationItem;

                    // Only add if it's for current user
                    if (newNotification.userId === userId) {
                        setNotifications(prev => {
                            const exists = prev.some(n => n.$id === newNotification.$id);
                            if (exists) return prev;
                            return [newNotification, ...prev].slice(0, 10);
                        });

                        if (!newNotification.read) {
                            setUnreadCount(prev => prev + 1);
                        }

                        // Show desktop notification
                        showDesktopNotification(newNotification);
                    }
                }

                // Handle updates (mark as read)
                if (response.events.includes('databases.*.collections.*.documents.*.update')) {
                    const updatedNotification = response.payload as NotificationItem;

                    if (updatedNotification.userId === userId) {
                        setNotifications(prev =>
                            prev.map(n => n.$id === updatedNotification.$id ? updatedNotification : n)
                        );

                        if (updatedNotification.read) {
                            setUnreadCount(prev => Math.max(0, prev - 1));
                        }
                    }
                }

                // Handle deletes
                if (response.events.includes('databases.*.collections.*.documents.*.delete')) {
                    const deletedId = response.payload.$id;
                    setNotifications(prev => prev.filter(n => n.$id !== deletedId));
                }
            }
        );

        return unsubscribe;
    };

    const showDesktopNotification = (notification: NotificationItem) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            // Only show for important types
            if (['message', 'document_rejected', 'certificate_uploaded'].includes(notification.type)) {
                const notif = new Notification(notification.title || 'Notification', {
                    icon: '/logo.png',
                    body: notification.description || notification.message,
                    tag: notification.orderId,
                    requireInteraction: false
                });

                notif.onclick = () => {
                    window.focus();
                    if (notification.actionUrl) {
                        window.location.href = notification.actionUrl;
                    }
                };
            }
        }
    };

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PATCH'
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!userId) return;

        try {
            const response = await fetch('/api/notifications/read-all', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (notificationId: string) => {
        try {
            await fetch(`/api/notifications/${notificationId}`, {
                method: 'DELETE'
            });

            setNotifications(prev => prev.filter(n => n.$id !== notificationId));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleNotificationClick = (notification: NotificationItem) => {
        if (!notification.read) {
            handleMarkAsRead(notification.$id);
        }
        setIsOpen(false);
        if (notification.actionUrl) {
            window.location.href = notification.actionUrl;
        }
    };

    // Request desktop notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Don't render if user is not logged in
    if (!userId) {
        return null;
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors z-50"
                style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <NotificationDropdown
                    notifications={notifications}
                    loading={loading}
                    onClose={() => setIsOpen(false)}
                    onNotificationClick={handleNotificationClick}
                    onMarkAllRead={handleMarkAllAsRead}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}

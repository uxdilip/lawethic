'use client';

import { NotificationItem } from '@/lib/notifications/types';
import { X, MessageCircle, FileCheck, FileX, Award, CreditCard, UserPlus, Bell as BellIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface NotificationDropdownProps {
    notifications: NotificationItem[];
    loading: boolean;
    onClose: () => void;
    onNotificationClick: (notification: NotificationItem) => void;
    onMarkAllRead: () => void;
    onDelete: (id: string) => void;
    bellButtonRef?: React.RefObject<HTMLButtonElement>;
}

export default function NotificationDropdown({
    notifications,
    loading,
    onClose,
    onNotificationClick,
    onMarkAllRead,
    onDelete,
    bellButtonRef
}: NotificationDropdownProps) {
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(target);
            const isOutsideBellButton = bellButtonRef?.current && !bellButtonRef.current.contains(target);

            if (isOutsideDropdown && isOutsideBellButton) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose, bellButtonRef]);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'message':
                return <MessageCircle className="w-5 h-5 text-blue-500" />;
            case 'document_verified':
                return <FileCheck className="w-5 h-5 text-green-500" />;
            case 'document_rejected':
                return <FileX className="w-5 h-5 text-red-500" />;
            case 'certificate_uploaded':
                return <Award className="w-5 h-5 text-yellow-500" />;
            case 'payment_received':
                return <CreditCard className="w-5 h-5 text-green-500" />;
            case 'case_assigned':
                return <UserPlus className="w-5 h-5 text-indigo-500" />;
            default:
                return <BellIcon className="w-5 h-5 text-gray-500" />;
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
        return date.toLocaleDateString();
    };

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                {notifications.length > 0 && (
                    <button
                        onClick={onMarkAllRead}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Mark all read
                    </button>
                )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                        <BellIcon className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 text-center">No notifications yet</p>
                        <p className="text-gray-400 text-sm text-center mt-1">
                            We'll notify you when something happens
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                            <div
                                key={notification.$id}
                                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative ${!notification.read ? 'bg-blue-50' : ''
                                    }`}
                                onClick={() => onNotificationClick(notification)}
                            >
                                {/* Unread Indicator */}
                                {!notification.read && (
                                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}

                                <div className="flex items-start gap-3 pl-3">
                                    {/* Icon */}
                                    <div className="flex-shrink-0 mt-1">
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 mb-1">
                                            {notification.title || 'Notification'}
                                        </p>
                                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                            {notification.description || notification.message}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-400">
                                                {formatTimestamp(notification.$createdAt)}
                                            </span>
                                            {notification.actionLabel && (
                                                <span className="text-xs text-blue-600 font-medium">
                                                    {notification.actionLabel} →
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(notification.$id);
                                        }}
                                        className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 text-center">
                    <button
                        onClick={onClose}
                        className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}

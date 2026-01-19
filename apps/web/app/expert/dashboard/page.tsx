'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { databases, account } from '@lawethic/appwrite/client';
import { appwriteConfig } from '@lawethic/appwrite/config';
import { Query } from 'appwrite';
import {
    MessageSquare,
    Calendar,
    Clock,
    CheckCircle,
    ArrowRight,
    Loader2,
    Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ConsultationCase, ConsultationStatus } from '@lawethic/appwrite/types';

interface DashboardStats {
    totalConsultations: number;
    scheduledMeetings: number;
    pendingRecommendations: number;
    completedThisMonth: number;
}

export default function ExpertDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        totalConsultations: 0,
        scheduledMeetings: 0,
        pendingRecommendations: 0,
        completedThisMonth: 0,
    });
    const [upcomingMeetings, setUpcomingMeetings] = useState<ConsultationCase[]>([]);
    const [recentCases, setRecentCases] = useState<ConsultationCase[]>([]);
    const [expertId, setExpertId] = useState<string>('');

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const user = await account.get();
            setExpertId(user.$id);

            // Fetch all consultations
            const consultationsRes = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.consultationCases,
                [
                    Query.orderDesc('$createdAt'),
                    Query.limit(100),
                ]
            );

            const consultations = consultationsRes.documents as unknown as ConsultationCase[];

            // Calculate stats
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const scheduled = consultations.filter(c => c.status === 'meeting_scheduled');
            const pendingRecs = consultations.filter(c => c.status === 'meeting_completed');
            const completedThisMonth = consultations.filter(c =>
                (c.status === 'recommendations_sent' || c.status === 'closed' || c.status === 'converted') &&
                new Date(c.$updatedAt) >= startOfMonth
            );

            setStats({
                totalConsultations: consultations.length,
                scheduledMeetings: scheduled.length,
                pendingRecommendations: pendingRecs.length,
                completedThisMonth: completedThisMonth.length,
            });

            // Get upcoming meetings (sorted by meeting date)
            const meetingsWithDates = scheduled
                .filter(c => c.scheduledAt)
                .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
                .slice(0, 5);
            setUpcomingMeetings(meetingsWithDates);

            // Get recent cases (last 5)
            setRecentCases(consultations.slice(0, 5));

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
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

    const getStatusColor = (status: ConsultationStatus) => {
        const colors: Record<ConsultationStatus, string> = {
            submitted: 'bg-gray-100 text-gray-700',
            under_review: 'bg-blue-50 text-blue-700',
            pending_assignment: 'bg-orange-50 text-orange-700',
            meeting_scheduled: 'bg-purple-50 text-purple-700',
            meeting_completed: 'bg-amber-50 text-amber-700',
            recommendations_sent: 'bg-emerald-50 text-emerald-700',
            converted: 'bg-green-50 text-green-700',
            cancelled: 'bg-red-50 text-red-600',
            closed: 'bg-neutral-100 text-neutral-600',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getStatusLabel = (status: ConsultationStatus) => {
        const labels: Record<ConsultationStatus, string> = {
            submitted: 'Submitted',
            under_review: 'Under Review',
            pending_assignment: 'Pending',
            meeting_scheduled: 'Scheduled',
            meeting_completed: 'Awaiting Recommendations',
            recommendations_sent: 'Completed',
            converted: 'Converted',
            cancelled: 'Cancelled',
            closed: 'Closed',
        };
        return labels[status] || status;
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-64px)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
                <p className="text-neutral-500 mt-1">Welcome back! Here&apos;s your consultation overview.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-neutral-200 p-5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 rounded-lg">
                            <MessageSquare className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-900">{stats.totalConsultations}</p>
                            <p className="text-sm text-neutral-500">Total Assigned</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-neutral-200 p-5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-900">{stats.scheduledMeetings}</p>
                            <p className="text-sm text-neutral-500">Scheduled Meetings</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-neutral-200 p-5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 rounded-lg">
                            <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-900">{stats.pendingRecommendations}</p>
                            <p className="text-sm text-neutral-500">Pending Recommendations</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-neutral-200 p-5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-900">{stats.completedThisMonth}</p>
                            <p className="text-sm text-neutral-500">Completed This Month</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Meetings */}
                <div className="bg-white rounded-xl border border-neutral-200">
                    <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                        <h2 className="font-semibold text-neutral-900">Upcoming Meetings</h2>
                        <Link href="/expert/consultations?status=meeting_scheduled">
                            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                                View All <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </div>
                    <div className="p-5">
                        {upcomingMeetings.length === 0 ? (
                            <div className="text-center py-8 text-neutral-500">
                                <Calendar className="w-10 h-10 mx-auto mb-3 text-neutral-300" />
                                <p>No upcoming meetings</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {upcomingMeetings.map((meeting) => (
                                    <Link
                                        key={meeting.$id}
                                        href={`/expert/consultations/${meeting.$id}`}
                                        className="block p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-neutral-900 truncate">
                                                    {meeting.customerName}
                                                </p>
                                                <p className="text-sm text-neutral-500 truncate mt-0.5">
                                                    {meeting.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2 text-sm text-neutral-600">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{formatDate(meeting.scheduledAt!)}</span>
                                                    <span className="text-neutral-300">•</span>
                                                    <Clock className="w-4 h-4" />
                                                    <span>{formatTime(meeting.scheduledAt!)}</span>
                                                </div>
                                            </div>
                                            {meeting.meetingLink && (
                                                <a
                                                    href={meeting.meetingLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                                                >
                                                    <Video className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Cases */}
                <div className="bg-white rounded-xl border border-neutral-200">
                    <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                        <h2 className="font-semibold text-neutral-900">Recent Cases</h2>
                        <Link href="/expert/consultations">
                            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                                View All <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </div>
                    <div className="p-5">
                        {recentCases.length === 0 ? (
                            <div className="text-center py-8 text-neutral-500">
                                <MessageSquare className="w-10 h-10 mx-auto mb-3 text-neutral-300" />
                                <p>No cases assigned yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentCases.map((caseItem) => (
                                    <Link
                                        key={caseItem.$id}
                                        href={`/expert/consultations/${caseItem.$id}`}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-neutral-900 truncate">
                                                {caseItem.caseNumber}
                                            </p>
                                            <p className="text-sm text-neutral-500 truncate">
                                                {caseItem.customerName}
                                            </p>
                                        </div>
                                        <span className={cn(
                                            "px-2 py-1 text-xs font-medium rounded-full",
                                            getStatusColor(caseItem.status)
                                        )}>
                                            {getStatusLabel(caseItem.status)}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

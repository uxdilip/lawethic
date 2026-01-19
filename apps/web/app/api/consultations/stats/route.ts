import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases } from '@lawethic/appwrite/server';
import { appwriteConfig } from '@lawethic/appwrite/config';
import { Query } from 'node-appwrite';

export async function GET(request: NextRequest) {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Get all consultation cases
        const allCases = await serverDatabases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.consultationCases,
            [Query.limit(1000)]
        );

        // Get cases from last 30 days
        const recentCases = await serverDatabases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.consultationCases,
            [
                Query.greaterThan('$createdAt', thirtyDaysAgo.toISOString()),
                Query.limit(1000)
            ]
        );

        // Get cases from last 7 days
        const weekCases = await serverDatabases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.consultationCases,
            [
                Query.greaterThan('$createdAt', sevenDaysAgo.toISOString()),
                Query.limit(1000)
            ]
        );

        // Calculate stats
        const stats = {
            total: allCases.total,
            thisWeek: weekCases.total,
            thisMonth: recentCases.total,

            byStatus: {
                submitted: 0,
                under_review: 0,
                pending_assignment: 0,
                meeting_scheduled: 0,
                meeting_completed: 0,
                recommendations_sent: 0,
                converted: 0,
                cancelled: 0,
                closed: 0,
            } as Record<string, number>,

            byCaseType: {} as Record<string, number>,

            funnel: {
                submitted: 0,
                scheduled: 0,
                completed: 0,
                converted: 0,
            },

            conversionRate: 0,
            schedulingRate: 0,
            completionRate: 0,
        };

        // Process all cases
        for (const caseDoc of allCases.documents) {
            // Count by status
            const status = caseDoc.status as string;
            if (stats.byStatus[status] !== undefined) {
                stats.byStatus[status]++;
            }

            // Count by case type
            const caseType = caseDoc.caseType as string;
            stats.byCaseType[caseType] = (stats.byCaseType[caseType] || 0) + 1;

            // Build funnel
            stats.funnel.submitted++;

            if (['meeting_scheduled', 'meeting_completed', 'recommendations_sent', 'converted', 'closed'].includes(status)) {
                stats.funnel.scheduled++;
            }

            if (['meeting_completed', 'recommendations_sent', 'converted', 'closed'].includes(status)) {
                stats.funnel.completed++;
            }

            if (status === 'converted') {
                stats.funnel.converted++;
            }
        }

        // Calculate rates
        if (stats.funnel.submitted > 0) {
            stats.schedulingRate = Math.round((stats.funnel.scheduled / stats.funnel.submitted) * 100);
        }

        if (stats.funnel.scheduled > 0) {
            stats.completionRate = Math.round((stats.funnel.completed / stats.funnel.scheduled) * 100);
        }

        if (stats.funnel.completed > 0) {
            stats.conversionRate = Math.round((stats.funnel.converted / stats.funnel.completed) * 100);
        }

        // Get upcoming meetings (next 7 days)
        const upcomingMeetings = await serverDatabases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.consultationCases,
            [
                Query.equal('status', 'meeting_scheduled'),
                Query.greaterThan('scheduledAt', now.toISOString()),
                Query.lessThan('scheduledAt', new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()),
                Query.orderAsc('scheduledAt'),
                Query.limit(10)
            ]
        );

        return NextResponse.json({
            success: true,
            stats,
            upcomingMeetings: upcomingMeetings.documents.map(m => ({
                id: m.$id,
                caseNumber: m.caseNumber,
                customerName: m.customerName,
                scheduledAt: m.scheduledAt,
                caseType: m.caseType,
            })),
        });

    } catch (error: any) {
        console.error('Error fetching consultation stats:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}

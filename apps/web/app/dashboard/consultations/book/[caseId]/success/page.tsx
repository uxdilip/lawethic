'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import {
    CheckCircle,
    Calendar,
    Clock,
    Video,
    Copy,
    Check,
    ArrowRight,
    Mail,
    MessageCircle
} from 'lucide-react';
import Link from 'next/link';

interface BookingDetails {
    date: string;
    startTime: string;
    endTime: string;
    meetingLink: string;
    caseNumber: string;
}

export default function BookingSuccessPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const caseId = params.caseId as string;

    const [booking, setBooking] = useState<BookingDetails | null>(null);
    const [copied, setCopied] = useState(false);
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        const date = searchParams.get('date');
        const startTime = searchParams.get('startTime');
        const endTime = searchParams.get('endTime');
        const meetingLink = searchParams.get('meetingLink');
        const caseNumber = searchParams.get('caseNumber');

        if (date && startTime && meetingLink && caseNumber) {
            setBooking({
                date,
                startTime,
                endTime: endTime || '',
                meetingLink: decodeURIComponent(meetingLink),
                caseNumber,
            });
        }

        const timer = setTimeout(() => setShowConfetti(false), 3000);
        return () => clearTimeout(timer);
    }, [searchParams]);

    const copyToClipboard = async () => {
        if (booking?.meetingLink) {
            await navigator.clipboard.writeText(booking.meetingLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const addToCalendar = () => {
        if (!booking) return;

        const startDateTime = new Date(`${booking.date}T${booking.startTime}:00`);
        const endDateTime = booking.endTime
            ? new Date(`${booking.date}T${booking.endTime}:00`)
            : new Date(startDateTime.getTime() + 30 * 60 * 1000);

        const event = {
            title: 'LAWethic Expert Consultation',
            description: `Your free legal consultation for case ${booking.caseNumber}.\n\nJoin meeting: ${booking.meetingLink}`,
            start: startDateTime.toISOString().replace(/-|:|\.\d\d\d/g, ''),
            end: endDateTime.toISOString().replace(/-|:|\.\d\d\d/g, ''),
        };

        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&dates=${event.start}/${event.end}`;

        window.open(googleCalendarUrl, '_blank');
    };

    if (!booking) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-gray-600">Loading booking details...</p>
                </div>
            </div>
        );
    }

    const meetingDate = format(new Date(booking.date), 'EEEE, MMMM d, yyyy');
    const meetingTime = format(new Date(`${booking.date}T${booking.startTime}`), 'h:mm a');

    return (
        <div className="p-6 relative overflow-hidden">
            {/* Simple Confetti Animation */}
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-fall"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: '-10px',
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${2 + Math.random() * 2}s`,
                            }}
                        >
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                    backgroundColor: ['#1A2A44', '#AEC8FF', '#22c55e', '#facc15', '#f472b6'][Math.floor(Math.random() * 5)],
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            <div className="max-w-2xl mx-auto">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        Consultation Booked!
                    </h1>
                    <p className="text-gray-600">
                        Your free expert consultation has been scheduled
                    </p>
                </div>

                {/* Booking Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    {/* Header Bar */}
                    <div className="bg-gradient-to-r from-brand-600 to-brand-700 text-white px-6 py-4">
                        <p className="text-brand-200 text-sm">Case Number</p>
                        <p className="text-lg font-semibold">{booking.caseNumber}</p>
                    </div>

                    {/* Details */}
                    <div className="p-6 space-y-6">
                        {/* Date & Time */}
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-brand-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Date</p>
                                    <p className="font-semibold text-gray-900 text-sm">{meetingDate}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-brand-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Time</p>
                                    <p className="font-semibold text-gray-900 text-sm">{meetingTime}</p>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-100" />

                        {/* Meeting Link */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Video className="w-4 h-4 text-gray-600" />
                                <p className="font-medium text-gray-900 text-sm">Meeting Link</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 font-mono text-xs text-gray-600 truncate">
                                    {booking.meetingLink}
                                </div>
                                <button
                                    onClick={copyToClipboard}
                                    className="flex-shrink-0 p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                    title="Copy link"
                                >
                                    {copied ? (
                                        <Check className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <a
                                href={booking.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors text-sm"
                            >
                                <Video className="w-4 h-4" />
                                Join Meeting
                            </a>
                            <button
                                onClick={addToCalendar}
                                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-brand-200 text-brand-700 rounded-xl font-semibold hover:bg-brand-50 transition-colors text-sm"
                            >
                                <Calendar className="w-4 h-4" />
                                Add to Calendar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <Mail className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 text-sm mb-0.5">Confirmation Sent</p>
                                <p className="text-xs text-gray-600">
                                    Check your email for meeting details
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                                <MessageCircle className="w-4 h-4 text-amber-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 text-sm mb-0.5">Need to Reschedule?</p>
                                <p className="text-xs text-gray-600">
                                    Contact us 24 hours before
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* What's Next */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h2 className="font-semibold text-gray-900 mb-4 text-sm">What&apos;s Next?</h2>
                    <ol className="space-y-3">
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-xs">1</span>
                            <div>
                                <p className="font-medium text-gray-900 text-sm">Prepare Your Documents</p>
                                <p className="text-xs text-gray-600">Gather any relevant documents you&apos;d like to discuss</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-xs">2</span>
                            <div>
                                <p className="font-medium text-gray-900 text-sm">Join the Call</p>
                                <p className="text-xs text-gray-600">Click the meeting link at your scheduled time</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-xs">3</span>
                            <div>
                                <p className="font-medium text-gray-900 text-sm">Get Expert Guidance</p>
                                <p className="text-xs text-gray-600">Our expert will review your case and provide recommendations</p>
                            </div>
                        </li>
                    </ol>
                </div>

                {/* Back to Consultations */}
                <div className="text-center mt-6">
                    <Link
                        href="/dashboard/consultations"
                        className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium text-sm"
                    >
                        Back to Consultations
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Confetti animation keyframes */}
            <style jsx>{`
                @keyframes fall {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
                .animate-fall {
                    animation: fall linear forwards;
                }
            `}</style>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { databases } from '@lawethic/appwrite/client';
import { appwriteConfig } from '@lawethic/appwrite/config';
import { format, addDays, isToday } from 'date-fns';
import {
    Calendar, Clock, ChevronLeft, ChevronRight, Loader,
    ArrowLeft, Check, Video, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ConsultationCase, CASE_TYPE_LABELS } from '@lawethic/appwrite/types';

interface TimeSlot {
    date: string;
    startTime: string;
    endTime: string;
    available: boolean;
    formattedTime: string;
}

interface DaySlots {
    date: string;
    dayName: string;
    formattedDate: string;
    slots: TimeSlot[];
}

export default function BookSlotPage() {
    const params = useParams();
    const router = useRouter();
    const caseId = params.caseId as string;

    const [caseData, setCaseData] = useState<ConsultationCase | null>(null);
    const [loading, setLoading] = useState(true);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [booking, setBooking] = useState(false);

    const [weekStart, setWeekStart] = useState(new Date());
    const [availableSlots, setAvailableSlots] = useState<DaySlots[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [noAvailability, setNoAvailability] = useState(false);

    useEffect(() => {
        loadCase();
    }, [caseId]);

    useEffect(() => {
        loadSlots();
    }, [weekStart]);

    const loadCase = async () => {
        try {
            const response = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.consultationCases,
                caseId
            );
            setCaseData(response as unknown as ConsultationCase);
        } catch (error) {
            console.error('Failed to load case:', error);
            toast.error('Failed to load consultation');
        } finally {
            setLoading(false);
        }
    };

    const loadSlots = async () => {
        try {
            setSlotsLoading(true);
            const startDate = format(weekStart, 'yyyy-MM-dd');
            const response = await fetch(`/api/consultations/slots?startDate=${startDate}&numDays=14`);
            const data = await response.json();

            if (data.success) {
                setAvailableSlots(data.slots);
                if (data.slots.length === 0 && data.message === 'No availability configured') {
                    setNoAvailability(true);
                } else {
                    setNoAvailability(false);
                    if (data.slots.length > 0 && !selectedDate) {
                        const firstDateWithSlots = data.slots.find((d: DaySlots) => d.slots.some(s => s.available));
                        if (firstDateWithSlots) {
                            setSelectedDate(firstDateWithSlots.date);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load slots:', error);
        } finally {
            setSlotsLoading(false);
        }
    };

    const navigateWeek = (direction: 'prev' | 'next') => {
        setWeekStart(prev => addDays(prev, direction === 'next' ? 7 : -7));
        setSelectedDate(null);
        setSelectedSlot(null);
    };

    const handleBookSlot = async () => {
        if (!selectedSlot || !caseData) return;

        try {
            setBooking(true);
            const response = await fetch('/api/consultations/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    caseId,
                    date: selectedSlot.date,
                    startTime: selectedSlot.startTime,
                    endTime: selectedSlot.endTime,
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Consultation booked successfully!');
                const params = new URLSearchParams({
                    date: selectedSlot.date,
                    startTime: selectedSlot.startTime,
                    endTime: selectedSlot.endTime,
                    meetingLink: encodeURIComponent(data.booking.meetingLink),
                    caseNumber: caseData.caseNumber,
                });
                router.push(`/dashboard/consultations/book/${caseId}/success?${params.toString()}`);
            } else {
                throw new Error(data.error || 'Failed to book');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to book slot');
        } finally {
            setBooking(false);
        }
    };

    const selectedDaySlots = availableSlots.find(d => d.date === selectedDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <Loader className="w-8 h-8 animate-spin text-brand-600" />
            </div>
        );
    }

    if (!caseData) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <h1 className="text-xl font-semibold text-neutral-900">Case not found</h1>
                    <Link href="/dashboard/consultations/new" className="text-brand-600 hover:text-brand-700 mt-2 inline-block">
                        Start a new consultation
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/dashboard/consultations"
                    className="text-sm text-neutral-500 hover:text-neutral-700 mb-2 inline-flex items-center"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Consultations
                </Link>
                <h1 className="text-2xl font-bold text-neutral-900">Book Consultation Slot</h1>
                <p className="text-neutral-500 mt-1">
                    Select a convenient time for your free expert consultation
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Panel - Case Info */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-neutral-200 p-6 sticky top-6">
                        <div className="border-b border-neutral-100 pb-4 mb-4">
                            <h2 className="text-lg font-semibold text-neutral-900">
                                Free Expert Consultation
                            </h2>
                            <p className="text-neutral-500 mt-1 text-sm">LawEthic</p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-neutral-600 text-sm">
                                <Clock className="w-4 h-4 text-neutral-400" />
                                <span>30 min</span>
                            </div>
                            <div className="flex items-center gap-3 text-neutral-600 text-sm">
                                <Video className="w-4 h-4 text-neutral-400" />
                                <span>Google Meet</span>
                            </div>
                            <div className="flex items-center gap-3 text-neutral-600 text-sm">
                                <Globe className="w-4 h-4 text-neutral-400" />
                                <span>India Standard Time</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-neutral-100">
                            <p className="text-xs text-neutral-500 mb-1">Your Case</p>
                            <p className="font-medium text-neutral-900">{caseData.title}</p>
                            <p className="text-sm text-neutral-500 mt-1">
                                {CASE_TYPE_LABELS[caseData.caseType]}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Slot Picker */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-neutral-100">
                            <h3 className="text-lg font-semibold text-neutral-900">Select a Date & Time</h3>
                        </div>

                        {noAvailability ? (
                            <div className="p-12 text-center">
                                <Calendar className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                                <h4 className="text-lg font-semibold text-neutral-900 mb-2">No Availability Yet</h4>
                                <p className="text-neutral-500 mb-6 max-w-sm mx-auto">
                                    Our experts are currently setting up their availability. Please check back soon or contact us directly.
                                </p>
                                <a
                                    href="mailto:support@lawethic.com"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors"
                                >
                                    Contact Support
                                </a>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-100">
                                {/* Calendar Section */}
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <button
                                            onClick={() => navigateWeek('prev')}
                                            disabled={weekStart <= new Date()}
                                            className="p-2 rounded-lg hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="w-5 h-5 text-neutral-600" />
                                        </button>
                                        <h4 className="font-semibold text-neutral-900">
                                            {format(weekStart, 'MMMM yyyy')}
                                        </h4>
                                        <button
                                            onClick={() => navigateWeek('next')}
                                            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                                        >
                                            <ChevronRight className="w-5 h-5 text-neutral-600" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                                            <div key={day} className="text-center text-xs font-medium text-neutral-400 py-2">
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-7 gap-1">
                                        {weekDays.map((date) => {
                                            const dateStr = format(date, 'yyyy-MM-dd');
                                            const hasSlots = availableSlots.some(d => d.date === dateStr);
                                            const isSelected = selectedDate === dateStr;
                                            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                                            const isTodayDate = isToday(date);

                                            return (
                                                <button
                                                    key={dateStr}
                                                    onClick={() => {
                                                        if (hasSlots && !isPast) {
                                                            setSelectedDate(dateStr);
                                                            setSelectedSlot(null);
                                                        }
                                                    }}
                                                    disabled={!hasSlots || isPast}
                                                    className={cn(
                                                        "aspect-square flex flex-col items-center justify-center rounded-lg transition-all text-sm",
                                                        isPast && "text-neutral-300 cursor-not-allowed",
                                                        !hasSlots && !isPast && "text-neutral-300 cursor-not-allowed",
                                                        hasSlots && !isSelected && "hover:bg-brand-50 text-neutral-700 font-medium",
                                                        isSelected && "bg-brand-600 text-white font-semibold",
                                                        isTodayDate && !isSelected && "ring-2 ring-brand-300 ring-inset"
                                                    )}
                                                >
                                                    <span>{date.getDate()}</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                                            <div className="w-3 h-3 rounded bg-brand-600"></div>
                                            <span>Selected</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                                            <div className="w-3 h-3 rounded border-2 border-brand-300"></div>
                                            <span>Today</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Time Slots Section */}
                                <div className="p-6">
                                    {slotsLoading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader className="w-6 h-6 animate-spin text-brand-600" />
                                        </div>
                                    ) : selectedDate ? (
                                        <>
                                            <h4 className="font-medium text-neutral-900 mb-4">
                                                {selectedDaySlots?.dayName}, {selectedDaySlots?.formattedDate}
                                            </h4>

                                            {selectedDaySlots && selectedDaySlots.slots.filter(s => s.available).length > 0 ? (
                                                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2">
                                                    {selectedDaySlots.slots
                                                        .filter(slot => slot.available)
                                                        .map((slot) => {
                                                            const isSlotSelected = selectedSlot?.startTime === slot.startTime && selectedSlot?.date === slot.date;

                                                            return (
                                                                <button
                                                                    key={`${slot.date}-${slot.startTime}`}
                                                                    onClick={() => setSelectedSlot(slot)}
                                                                    className={cn(
                                                                        "w-full py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all",
                                                                        isSlotSelected
                                                                            ? "border-brand-600 bg-brand-600 text-white"
                                                                            : "border-brand-200 text-brand-700 hover:border-brand-400 hover:bg-brand-50"
                                                                    )}
                                                                >
                                                                    {slot.formattedTime}
                                                                </button>
                                                            );
                                                        })}
                                                </div>
                                            ) : (
                                                <div className="py-12 text-center text-neutral-500">
                                                    <Calendar className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                                                    <p>No available slots for this day</p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="py-12 text-center text-neutral-500">
                                            <Calendar className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                                            <p>Select a date to see available times</p>
                                        </div>
                                    )}

                                    {/* Book Button */}
                                    {selectedSlot && (
                                        <div className="mt-6 pt-4 border-t border-neutral-100">
                                            <div className="bg-brand-50 rounded-xl p-4 mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                                                        <Check className="w-5 h-5 text-brand-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-brand-900">
                                                            {format(new Date(selectedSlot.date), 'EEEE, MMMM d')}
                                                        </p>
                                                        <p className="text-sm text-brand-600">
                                                            {selectedSlot.formattedTime}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleBookSlot}
                                                disabled={booking}
                                                className="w-full py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {booking ? (
                                                    <>
                                                        <Loader className="w-5 h-5 animate-spin" />
                                                        Booking...
                                                    </>
                                                ) : (
                                                    'Confirm Booking'
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 bg-brand-50 rounded-xl p-4 border border-brand-100">
                        <p className="text-sm text-brand-700">
                            <strong>Free Consultation:</strong> This is a complimentary 30-minute session with our expert.
                            You&apos;ll receive a Google Meet link via email after booking.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

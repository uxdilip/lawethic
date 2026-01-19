'use client';

import { useEffect, useState } from 'react';
import { account } from '@lawethic/appwrite/client';


import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import {
    Clock, Calendar, Plus, Trash2, Save, Loader, Check, X,
    ChevronLeft, ChevronRight, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

interface DaySchedule {
    dayOfWeek: number;
    dayName: string;
    isActive: boolean;
    startTime: string;
    endTime: string;
    slotDuration: number;
    bufferTime: number;
}

interface BlockedDate {
    $id: string;
    date: string;
    reason: string;
}

const DAYS = [
    { dayOfWeek: 1, dayName: 'Monday' },
    { dayOfWeek: 2, dayName: 'Tuesday' },
    { dayOfWeek: 3, dayName: 'Wednesday' },
    { dayOfWeek: 4, dayName: 'Thursday' },
    { dayOfWeek: 5, dayName: 'Friday' },
    { dayOfWeek: 6, dayName: 'Saturday' },
    { dayOfWeek: 0, dayName: 'Sunday' },
];

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return [`${hour}:00`, `${hour}:30`];
}).flat();

export default function AvailabilitySettingsPage() {
    const [expertId, setExpertId] = useState<string>('');
    const [schedule, setSchedule] = useState<DaySchedule[]>(
        DAYS.map(day => ({
            ...day,
            isActive: day.dayOfWeek >= 1 && day.dayOfWeek <= 5, // Mon-Fri active by default
            startTime: '10:00',
            endTime: '22:30',
            slotDuration: 30,
            bufferTime: 15,
        }))
    );
    const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [newBlockedDate, setNewBlockedDate] = useState('');
    const [newBlockedReason, setNewBlockedReason] = useState('');

    useEffect(() => {
        loadUserAndAvailability();
    }, []);

    const loadUserAndAvailability = async () => {
        try {
            setLoading(true);
            const user = await account.get();
            setExpertId(user.$id);

            // Load existing availability
            const availRes = await fetch(`/api/availability?expertId=${user.$id}`);
            const availData = await availRes.json();

            if (availData.success && availData.availability.length > 0) {
                // Map existing availability to schedule
                const newSchedule = DAYS.map(day => {
                    const existing = availData.availability.find(
                        (a: any) => a.dayOfWeek === day.dayOfWeek
                    );
                    if (existing) {
                        return {
                            ...day,
                            isActive: existing.isActive,
                            startTime: existing.startTime,
                            endTime: existing.endTime,
                            slotDuration: existing.slotDuration,
                            bufferTime: existing.bufferTime,
                        };
                    }
                    return {
                        ...day,
                        isActive: false,
                        startTime: '10:00',
                        endTime: '22:30',
                        slotDuration: 30,
                        bufferTime: 15,
                    };
                });
                setSchedule(newSchedule);
            }

            // Load blocked dates
            const blockedRes = await fetch(`/api/availability/blocked-dates?expertId=${user.$id}`);
            const blockedData = await blockedRes.json();
            if (blockedData.success) {
                setBlockedDates(blockedData.blockedDates);
            }
        } catch (error) {
            console.error('Failed to load availability:', error);
            toast.error('Failed to load availability settings');
        } finally {
            setLoading(false);
        }
    };

    const saveAvailability = async () => {
        try {
            setSaving(true);
            const response = await fetch('/api/availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    expertId,
                    availability: schedule,
                }),
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Availability saved successfully');
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Failed to save availability:', error);
            toast.error('Failed to save availability');
        } finally {
            setSaving(false);
        }
    };

    const updateDaySchedule = (dayOfWeek: number, updates: Partial<DaySchedule>) => {
        setSchedule(prev =>
            prev.map(day =>
                day.dayOfWeek === dayOfWeek ? { ...day, ...updates } : day
            )
        );
    };

    const addBlockedDate = async () => {
        if (!newBlockedDate) {
            toast.error('Please select a date');
            return;
        }

        try {
            const response = await fetch('/api/availability/blocked-dates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    expertId,
                    date: newBlockedDate,
                    reason: newBlockedReason,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setBlockedDates(prev => [...prev, data.blockedDate]);
                setNewBlockedDate('');
                setNewBlockedReason('');
                toast.success('Date blocked successfully');
            } else {
                throw new Error(data.error);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to block date');
        }
    };

    const removeBlockedDate = async (id: string) => {
        try {
            const response = await fetch(`/api/availability/blocked-dates?id=${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (data.success) {
                setBlockedDates(prev => prev.filter(d => d.$id !== id));
                toast.success('Date unblocked');
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            toast.error('Failed to unblock date');
        }
    };

    // Calendar navigation
    const goToPrevMonth = () => {
        setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    // Generate calendar days
    const generateCalendarDays = () => {
        const start = startOfWeek(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1));
        const days = [];
        for (let i = 0; i < 42; i++) {
            days.push(addDays(start, i));
        }
        return days;
    };

    const calendarDays = generateCalendarDays();

    if (loading) {
        return (
            <>

                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader className="w-8 h-8 animate-spin text-brand-600" />
                </div>

            </>
        );
    }

    return (
        <>

            <div className="p-6 max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-neutral-900">Availability Settings</h1>
                        <p className="text-neutral-500 mt-1">
                            Set your weekly schedule and manage blocked dates for consultations
                        </p>
                    </div>
                    <button
                        onClick={saveAvailability}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium disabled:opacity-50"
                    >
                        {saving ? (
                            <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save Changes
                    </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Weekly Schedule */}
                    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-brand-600" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-neutral-900">Weekly Hours</h2>
                                    <p className="text-sm text-neutral-500">Set your available hours for each day</p>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-neutral-100">
                            {schedule.map((day) => (
                                <div
                                    key={day.dayOfWeek}
                                    className={cn(
                                        "px-6 py-4 transition-colors",
                                        day.isActive ? "bg-white" : "bg-neutral-50/50"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Day Toggle */}
                                        <div className="flex items-center gap-3 w-32">
                                            <Switch
                                                checked={day.isActive}
                                                onCheckedChange={(checked) =>
                                                    updateDaySchedule(day.dayOfWeek, { isActive: checked })
                                                }
                                            />
                                            <span className={cn(
                                                "font-medium text-sm",
                                                day.isActive ? "text-neutral-900" : "text-neutral-400"
                                            )}>
                                                {day.dayName}
                                            </span>
                                        </div>

                                        {/* Time Selection */}
                                        {day.isActive ? (
                                            <div className="flex items-center gap-2 flex-1">
                                                <select
                                                    value={day.startTime}
                                                    onChange={(e) =>
                                                        updateDaySchedule(day.dayOfWeek, { startTime: e.target.value })
                                                    }
                                                    className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                                >
                                                    {TIME_OPTIONS.map(time => (
                                                        <option key={time} value={time}>{time}</option>
                                                    ))}
                                                </select>
                                                <span className="text-neutral-400">—</span>
                                                <select
                                                    value={day.endTime}
                                                    onChange={(e) =>
                                                        updateDaySchedule(day.dayOfWeek, { endTime: e.target.value })
                                                    }
                                                    className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                                >
                                                    {TIME_OPTIONS.map(time => (
                                                        <option key={time} value={time}>{time}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-neutral-400 italic">Unavailable</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Slot Settings */}
                        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-neutral-700">Meeting Duration</p>
                                    <p className="text-xs text-neutral-500">Default length for each slot</p>
                                </div>
                                <select
                                    value={schedule[0]?.slotDuration || 30}
                                    onChange={(e) => {
                                        const duration = parseInt(e.target.value);
                                        setSchedule(prev =>
                                            prev.map(day => ({ ...day, slotDuration: duration }))
                                        );
                                    }}
                                    className="px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                >
                                    <option value={15}>15 minutes</option>
                                    <option value={30}>30 minutes</option>
                                    <option value={45}>45 minutes</option>
                                    <option value={60}>60 minutes</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Blocked Dates Calendar */}
                    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-neutral-900">Blocked Dates</h2>
                                    <p className="text-sm text-neutral-500">Mark dates when you&apos;re unavailable</p>
                                </div>
                            </div>
                        </div>

                        {/* Mini Calendar */}
                        <div className="p-4">
                            {/* Month Navigation */}
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    onClick={goToPrevMonth}
                                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5 text-neutral-600" />
                                </button>
                                <h3 className="font-semibold text-neutral-900">
                                    {format(selectedMonth, 'MMMM yyyy')}
                                </h3>
                                <button
                                    onClick={goToNextMonth}
                                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5 text-neutral-600" />
                                </button>
                            </div>

                            {/* Day Headers */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                    <div key={day} className="text-center text-xs font-medium text-neutral-500 py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map((date, i) => {
                                    const isCurrentMonth = date.getMonth() === selectedMonth.getMonth();
                                    const isBlocked = blockedDates.some(bd =>
                                        isSameDay(new Date(bd.date), date)
                                    );
                                    const isToday = isSameDay(date, new Date());
                                    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                if (!isPast && isCurrentMonth) {
                                                    const dateStr = format(date, 'yyyy-MM-dd');
                                                    if (isBlocked) {
                                                        const blocked = blockedDates.find(bd => bd.date === dateStr);
                                                        if (blocked) removeBlockedDate(blocked.$id);
                                                    } else {
                                                        setNewBlockedDate(dateStr);
                                                    }
                                                }
                                            }}
                                            disabled={isPast || !isCurrentMonth}
                                            className={cn(
                                                "aspect-square flex items-center justify-center text-sm rounded-lg transition-all",
                                                !isCurrentMonth && "text-neutral-300",
                                                isCurrentMonth && !isBlocked && !isPast && "hover:bg-neutral-100 text-neutral-700",
                                                isCurrentMonth && isPast && "text-neutral-300 cursor-not-allowed",
                                                isBlocked && "bg-red-100 text-red-700 font-medium",
                                                isToday && !isBlocked && "ring-2 ring-brand-500 ring-offset-2"
                                            )}
                                        >
                                            {date.getDate()}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Add Blocked Date Form */}
                        {newBlockedDate && (
                            <div className="px-4 pb-4">
                                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium text-red-800">
                                            Block {format(new Date(newBlockedDate), 'MMMM d, yyyy')}
                                        </span>
                                        <button
                                            onClick={() => setNewBlockedDate('')}
                                            className="text-red-400 hover:text-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={newBlockedReason}
                                        onChange={(e) => setNewBlockedReason(e.target.value)}
                                        placeholder="Reason (optional)"
                                        className="w-full px-3 py-2 text-sm border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                                    />
                                    <button
                                        onClick={addBlockedDate}
                                        className="mt-3 w-full py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                                    >
                                        Block This Date
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Blocked Dates List */}
                        {blockedDates.length > 0 && (
                            <div className="px-4 pb-4">
                                <h4 className="text-sm font-medium text-neutral-700 mb-2">Upcoming Blocked Dates</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {blockedDates
                                        .filter(bd => new Date(bd.date) >= new Date())
                                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                        .map(bd => (
                                            <div
                                                key={bd.$id}
                                                className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium text-neutral-800">
                                                        {format(new Date(bd.date), 'EEE, MMM d')}
                                                    </p>
                                                    {bd.reason && (
                                                        <p className="text-xs text-neutral-500">{bd.reason}</p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => removeBlockedDate(bd.$id)}
                                                    className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Preview Section */}
                <div className="bg-gradient-to-r from-brand-50 to-brand-100/50 rounded-2xl p-6 border border-brand-200">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-brand-900 mb-1">How It Works</h3>
                            <p className="text-brand-700 text-sm leading-relaxed">
                                Customers will see available time slots based on your weekly schedule.
                                Each consultation is {schedule[0]?.slotDuration || 30} minutes long.
                                Blocked dates and already-booked slots will be automatically hidden from customers.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
}

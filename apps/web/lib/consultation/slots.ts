/**
 * Consultation Slot Generation Utility
 * 
 * Generates available time slots based on expert availability,
 * blocked dates, and existing bookings.
 */

import { addMinutes, format, parse, isBefore, isAfter, isSameDay, startOfDay } from 'date-fns';

export interface AvailabilityRule {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    slotDuration: number;
    bufferTime: number;
    isActive: boolean;
}

export interface Booking {
    date: string;
    startTime: string;
    endTime: string;
    status: string;
}

export interface TimeSlot {
    date: string;
    startTime: string;
    endTime: string;
    available: boolean;
    formattedTime: string;
}

export interface DaySlots {
    date: string;
    dayName: string;
    formattedDate: string;
    slots: TimeSlot[];
}

/**
 * Generate time slots for a specific date based on availability rules
 */
export function generateSlotsForDate(
    date: Date,
    availability: AvailabilityRule[],
    blockedDates: string[],
    existingBookings: Booking[],
    minAdvanceHours: number = 2
): TimeSlot[] {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay();

    // Check if date is blocked
    if (blockedDates.includes(dateStr)) {
        return [];
    }

    // Find availability rule for this day
    const rule = availability.find(a => a.dayOfWeek === dayOfWeek && a.isActive);
    if (!rule) {
        return [];
    }

    const slots: TimeSlot[] = [];
    const now = new Date();
    const minBookingTime = addMinutes(now, minAdvanceHours * 60);

    // Parse start and end times
    const startParts = rule.startTime.split(':');
    const endParts = rule.endTime.split(':');

    let currentSlotStart = new Date(date);
    currentSlotStart.setHours(parseInt(startParts[0]), parseInt(startParts[1]), 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(parseInt(endParts[0]), parseInt(endParts[1]), 0, 0);

    const slotDuration = rule.slotDuration;
    const bufferTime = rule.bufferTime;
    const totalSlotTime = slotDuration + bufferTime;

    // Get bookings for this date
    const dateBookings = existingBookings.filter(b => b.date === dateStr && b.status !== 'cancelled');

    while (isBefore(currentSlotStart, dayEnd)) {
        const slotEnd = addMinutes(currentSlotStart, slotDuration);

        // Check if slot end exceeds day end
        if (isAfter(slotEnd, dayEnd)) {
            break;
        }

        const startTimeStr = format(currentSlotStart, 'HH:mm');
        const endTimeStr = format(slotEnd, 'HH:mm');

        // Check if slot is in the past (with buffer)
        const isPast = isBefore(currentSlotStart, minBookingTime);

        // Check if slot overlaps with existing booking
        const isBooked = dateBookings.some(booking => {
            return (
                (startTimeStr >= booking.startTime && startTimeStr < booking.endTime) ||
                (endTimeStr > booking.startTime && endTimeStr <= booking.endTime) ||
                (startTimeStr <= booking.startTime && endTimeStr >= booking.endTime)
            );
        });

        slots.push({
            date: dateStr,
            startTime: startTimeStr,
            endTime: endTimeStr,
            available: !isPast && !isBooked,
            formattedTime: format(currentSlotStart, 'h:mm a'),
        });

        // Move to next slot (with buffer)
        currentSlotStart = addMinutes(currentSlotStart, totalSlotTime);
    }

    return slots;
}

/**
 * Generate slots for multiple days
 */
export function generateSlotsForDateRange(
    startDate: Date,
    numDays: number,
    availability: AvailabilityRule[],
    blockedDates: string[],
    existingBookings: Booking[],
    minAdvanceHours: number = 2
): DaySlots[] {
    const days: DaySlots[] = [];

    for (let i = 0; i < numDays; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        // Skip past dates and same-day bookings (only allow next day onwards)
        const today = startOfDay(new Date());
        if (isBefore(startOfDay(date), today) || isSameDay(date, today)) {
            continue;
        }

        const slots = generateSlotsForDate(
            date,
            availability,
            blockedDates,
            existingBookings,
            minAdvanceHours
        );

        // Only include days with available slots
        if (slots.some(s => s.available)) {
            days.push({
                date: format(date, 'yyyy-MM-dd'),
                dayName: format(date, 'EEEE'),
                formattedDate: format(date, 'MMM d'),
                slots,
            });
        }
    }

    return days;
}

/**
 * Get the next available slot
 */
export function getNextAvailableSlot(
    availability: AvailabilityRule[],
    blockedDates: string[],
    existingBookings: Booking[],
    maxDaysAhead: number = 30
): TimeSlot | null {
    const today = new Date();

    for (let i = 0; i < maxDaysAhead; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);

        const slots = generateSlotsForDate(
            date,
            availability,
            blockedDates,
            existingBookings
        );

        const availableSlot = slots.find(s => s.available);
        if (availableSlot) {
            return availableSlot;
        }
    }

    return null;
}

/**
 * Check if a specific slot is available
 */
export function isSlotAvailable(
    date: string,
    startTime: string,
    availability: AvailabilityRule[],
    blockedDates: string[],
    existingBookings: Booking[]
): boolean {
    const dateObj = new Date(date);
    const slots = generateSlotsForDate(
        dateObj,
        availability,
        blockedDates,
        existingBookings
    );

    const slot = slots.find(s => s.startTime === startTime);
    return slot?.available ?? false;
}

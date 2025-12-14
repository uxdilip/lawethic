/**
 * LawEthic Design System Tokens
 * 
 * Single source of truth for all design decisions.
 * Use these tokens throughout the application for consistency.
 */

// ============================================
// COLORS
// ============================================

export const colors = {
    // Brand Colors (Legal/Trust theme - Blue)
    brand: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',   // Primary brand color
        600: '#2563eb',   // Main interactive elements
        700: '#1d4ed8',   // Hover states
        800: '#1e40af',
        900: '#1e3a8a',
    },

    // Semantic Colors
    semantic: {
        success: {
            light: '#d1fae5',
            DEFAULT: '#10b981',
            dark: '#065f46',
        },
        warning: {
            light: '#fef3c7',
            DEFAULT: '#f59e0b',
            dark: '#92400e',
        },
        error: {
            light: '#fee2e2',
            DEFAULT: '#ef4444',
            dark: '#991b1b',
        },
        info: {
            light: '#dbeafe',
            DEFAULT: '#3b82f6',
            dark: '#1e40af',
        },
    },

    // Neutral Colors (Gray scale)
    neutral: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
    },
} as const;

// ============================================
// TYPOGRAPHY
// ============================================

export const typography = {
    fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Menlo', 'Monaco', 'Courier New', 'monospace'],
    },

    fontSize: {
        // Display sizes (Hero sections)
        'display-2xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'display': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],

        // Headings
        'h1': ['2rem', { lineHeight: '1.3', fontWeight: '700' }],
        'h2': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        'h3': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'h4': ['1.125rem', { lineHeight: '1.5', fontWeight: '600' }],
        'h5': ['1rem', { lineHeight: '1.5', fontWeight: '600' }],

        // Body text
        'body-lg': ['1.125rem', { lineHeight: '1.75' }],
        'body': ['1rem', { lineHeight: '1.625' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'body-xs': ['0.75rem', { lineHeight: '1.5' }],

        // UI elements
        'label': ['0.875rem', { lineHeight: '1.25', fontWeight: '500' }],
        'caption': ['0.75rem', { lineHeight: '1.25' }],
    },

    fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
    },
} as const;

// ============================================
// SPACING
// ============================================

export const spacing = {
    // Base spacing scale
    px: '1px',
    0: '0',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    12: '3rem',       // 48px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px

    // Semantic spacing
    section: '5rem',      // Between major sections
    container: '1.5rem',  // Container padding
    card: '1.5rem',       // Card padding
} as const;

// ============================================
// SHADOWS
// ============================================

export const shadows = {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',
} as const;

// ============================================
// BORDER RADIUS
// ============================================

export const borderRadius = {
    none: '0',
    sm: '0.125rem',   // 2px
    DEFAULT: '0.25rem',   // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
} as const;

// ============================================
// BREAKPOINTS
// ============================================

export const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
} as const;

// ============================================
// Z-INDEX SCALE
// ============================================

export const zIndex = {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
} as const;

// ============================================
// TRANSITIONS
// ============================================

export const transitions = {
    duration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
        slower: '500ms',
    },
    easing: {
        ease: 'ease',
        'ease-in': 'ease-in',
        'ease-out': 'ease-out',
        'ease-in-out': 'ease-in-out',
    },
} as const;

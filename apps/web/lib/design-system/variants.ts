/**
 * LawEthic Design System - Component Variants
 * 
 * Type-safe component variants using Class Variance Authority (CVA)
 * Use these for consistent styling across all components
 */

import { cva, type VariantProps } from 'class-variance-authority';

// ============================================
// BUTTON VARIANTS
// ============================================

export const buttonVariants = cva(
    // Base styles applied to all buttons
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-smooth focus-ring disabled:opacity-50 disabled:pointer-events-none',
    {
        variants: {
            variant: {
                // Primary brand button
                primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm',

                // Secondary outline button
                secondary: 'bg-white text-brand-600 border-2 border-brand-600 hover:bg-brand-50 active:bg-brand-100',

                // Outline button (neutral)
                outline: 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100',

                // Ghost button (no background)
                ghost: 'text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200',

                // Success button
                success: 'bg-success text-white hover:bg-success-dark shadow-sm',

                // Warning button
                warning: 'bg-warning text-white hover:bg-warning-dark shadow-sm',

                // Danger/Error button
                danger: 'bg-error text-white hover:bg-error-dark shadow-sm',

                // Link style button
                link: 'text-brand-600 underline-offset-4 hover:underline',
            },

            size: {
                sm: 'px-3 py-1.5 text-body-sm',
                md: 'px-4 py-2 text-body',
                lg: 'px-6 py-3 text-body-lg',
                xl: 'px-8 py-4 text-h5',
            },

            fullWidth: {
                true: 'w-full',
                false: '',
            },
        },

        defaultVariants: {
            variant: 'primary',
            size: 'md',
            fullWidth: false,
        },
    }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

// ============================================
// BADGE VARIANTS
// ============================================

export const badgeVariants = cva(
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-body-xs font-medium transition-smooth',
    {
        variants: {
            variant: {
                default: 'bg-neutral-100 text-neutral-800',
                primary: 'bg-brand-100 text-brand-800',
                success: 'bg-success-light text-success-dark',
                warning: 'bg-warning-light text-warning-dark',
                error: 'bg-error-light text-error-dark',
                info: 'bg-info-light text-info-dark',
            },

            size: {
                sm: 'text-caption px-2 py-0.5',
                md: 'text-body-xs px-2.5 py-0.5',
                lg: 'text-body-sm px-3 py-1',
            },
        },

        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    }
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

// ============================================
// CARD VARIANTS
// ============================================

export const cardVariants = cva(
    'rounded-xl transition-smooth',
    {
        variants: {
            variant: {
                default: 'bg-white border border-neutral-200',
                elevated: 'bg-white shadow-md',
                interactive: 'bg-white border border-neutral-200 hover:shadow-lg hover:border-brand-300 cursor-pointer',
                ghost: 'bg-neutral-50',
            },

            padding: {
                none: '',
                sm: 'p-4',
                md: 'p-6',
                lg: 'p-8',
            },
        },

        defaultVariants: {
            variant: 'default',
            padding: 'md',
        },
    }
);

export type CardVariants = VariantProps<typeof cardVariants>;

// ============================================
// INPUT VARIANTS
// ============================================

export const inputVariants = cva(
    'w-full rounded-lg border transition-smooth focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    {
        variants: {
            variant: {
                default: 'bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400',
                filled: 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder:text-neutral-400',
                error: 'bg-white border-error text-neutral-900 placeholder:text-neutral-400 focus:ring-error',
            },

            size: {
                sm: 'px-3 py-1.5 text-body-sm',
                md: 'px-4 py-2 text-body',
                lg: 'px-5 py-3 text-body-lg',
            },
        },

        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    }
);

export type InputVariants = VariantProps<typeof inputVariants>;

// ============================================
// ALERT VARIANTS
// ============================================

export const alertVariants = cva(
    'rounded-lg p-4 border-l-4',
    {
        variants: {
            variant: {
                info: 'bg-info-light border-info text-info-dark',
                success: 'bg-success-light border-success text-success-dark',
                warning: 'bg-warning-light border-warning text-warning-dark',
                error: 'bg-error-light border-error text-error-dark',
            },
        },

        defaultVariants: {
            variant: 'info',
        },
    }
);

export type AlertVariants = VariantProps<typeof alertVariants>;

// ============================================
// CONTAINER VARIANTS
// ============================================

export const containerVariants = cva(
    'mx-auto',
    {
        variants: {
            size: {
                sm: 'max-w-3xl',
                md: 'max-w-5xl',
                lg: 'max-w-7xl',
                full: 'max-w-full',
            },

            padding: {
                none: '',
                mobile: 'px-4',
                desktop: 'px-6 lg:px-8',
                both: 'px-4 lg:px-8',
            },
        },

        defaultVariants: {
            size: 'lg',
            padding: 'both',
        },
    }
);

export type ContainerVariants = VariantProps<typeof containerVariants>;

// ============================================
// TEXT VARIANTS
// ============================================

export const textVariants = cva(
    'transition-smooth',
    {
        variants: {
            variant: {
                display: 'text-display font-bold text-neutral-900',
                h1: 'text-h1 font-bold text-neutral-900',
                h2: 'text-h2 font-semibold text-neutral-900',
                h3: 'text-h3 font-semibold text-neutral-800',
                h4: 'text-h4 font-semibold text-neutral-800',
                h5: 'text-h5 font-semibold text-neutral-700',
                body: 'text-body text-neutral-700',
                'body-lg': 'text-body-lg text-neutral-700',
                'body-sm': 'text-body-sm text-neutral-600',
                caption: 'text-caption text-neutral-500',
                label: 'text-label text-neutral-700',
            },

            color: {
                default: '',
                primary: 'text-brand-600',
                success: 'text-success',
                warning: 'text-warning',
                error: 'text-error',
                muted: 'text-neutral-500',
            },

            align: {
                left: 'text-left',
                center: 'text-center',
                right: 'text-right',
            },
        },

        defaultVariants: {
            variant: 'body',
            color: 'default',
            align: 'left',
        },
    }
);

export type TextVariants = VariantProps<typeof textVariants>;

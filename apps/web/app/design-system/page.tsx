/**
 * LawEthic Design System Documentation
 * 
 * Visual reference for all design tokens, components, and patterns
 */

import React from 'react';
import { colors, typography, spacing, shadows, borderRadius } from '@/lib/design-system/tokens';
import {
    buttonVariants,
    badgeVariants,
    cardVariants,
    inputVariants,
    alertVariants,
} from '@/lib/design-system/variants';

export default function DesignSystemPage() {
    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <h1 className="text-h1 font-bold text-neutral-900">LawEthic Design System</h1>
                    <p className="text-body text-neutral-600 mt-2">
                        A comprehensive guide to colors, typography, components, and patterns
                    </p>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
                {/* ============================================
            COLORS
            ============================================ */}
                <section id="colors" className="scroll-mt-24">
                    <h2 className="text-h2 font-semibold text-neutral-900 mb-6">Colors</h2>

                    {/* Brand Colors */}
                    <div className="mb-8">
                        <h3 className="text-h3 font-semibold text-neutral-800 mb-4">Brand Colors</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
                            {Object.entries(colors.brand).map(([shade, color]) => (
                                <div key={shade} className="space-y-2">
                                    <div
                                        className="h-20 rounded-lg shadow-md border border-neutral-200"
                                        style={{ backgroundColor: color }}
                                    />
                                    <div className="text-body-sm">
                                        <p className="font-medium text-neutral-900">brand-{shade}</p>
                                        <p className="text-neutral-600 font-mono text-caption">{color}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Semantic Colors */}
                    <div className="mb-8">
                        <h3 className="text-h3 font-semibold text-neutral-800 mb-4">Semantic Colors</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {Object.entries(colors.semantic).map(([name, shades]) => (
                                <div key={name} className="space-y-2">
                                    <h4 className="text-h5 font-semibold capitalize mb-3">{name}</h4>
                                    {Object.entries(shades).map(([shade, color]) => (
                                        <div key={shade} className="flex items-center gap-3">
                                            <div
                                                className="w-12 h-12 rounded-lg shadow-sm border border-neutral-200"
                                                style={{ backgroundColor: color }}
                                            />
                                            <div className="text-body-sm">
                                                <p className="font-medium text-neutral-900">{shade}</p>
                                                <p className="text-neutral-600 font-mono text-caption">{color}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Neutral Colors */}
                    <div>
                        <h3 className="text-h3 font-semibold text-neutral-800 mb-4">Neutral Colors</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
                            {Object.entries(colors.neutral).map(([shade, color]) => (
                                <div key={shade} className="space-y-2">
                                    <div
                                        className="h-20 rounded-lg shadow-md border border-neutral-200"
                                        style={{ backgroundColor: color }}
                                    />
                                    <div className="text-body-sm">
                                        <p className="font-medium text-neutral-900">neutral-{shade}</p>
                                        <p className="text-neutral-600 font-mono text-caption">{color}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ============================================
            TYPOGRAPHY
            ============================================ */}
                <section id="typography" className="scroll-mt-24">
                    <h2 className="text-h2 font-semibold text-neutral-900 mb-6">Typography</h2>

                    {/* Display Sizes */}
                    <div className="bg-white rounded-xl p-8 border border-neutral-200 mb-6">
                        <h3 className="text-h3 font-semibold text-neutral-800 mb-6">Display Sizes</h3>
                        <div className="space-y-6">
                            <div>
                                <p className="text-display-2xl">Display 2XL</p>
                                <code className="text-caption text-neutral-500 font-mono">text-display-2xl</code>
                            </div>
                            <div>
                                <p className="text-display-xl">Display XL</p>
                                <code className="text-caption text-neutral-500 font-mono">text-display-xl</code>
                            </div>
                            <div>
                                <p className="text-display-lg">Display Large</p>
                                <code className="text-caption text-neutral-500 font-mono">text-display-lg</code>
                            </div>
                            <div>
                                <p className="text-display">Display</p>
                                <code className="text-caption text-neutral-500 font-mono">text-display</code>
                            </div>
                        </div>
                    </div>

                    {/* Headings */}
                    <div className="bg-white rounded-xl p-8 border border-neutral-200 mb-6">
                        <h3 className="text-h3 font-semibold text-neutral-800 mb-6">Headings</h3>
                        <div className="space-y-4">
                            {['h1', 'h2', 'h3', 'h4', 'h5'].map((heading) => (
                                <div key={heading}>
                                    <p className={`text-${heading}`}>Heading {heading.toUpperCase()}</p>
                                    <code className="text-caption text-neutral-500 font-mono">text-{heading}</code>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Body Text */}
                    <div className="bg-white rounded-xl p-8 border border-neutral-200">
                        <h3 className="text-h3 font-semibold text-neutral-800 mb-6">Body Text</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-body-lg">Body Large - The quick brown fox jumps over the lazy dog</p>
                                <code className="text-caption text-neutral-500 font-mono">text-body-lg</code>
                            </div>
                            <div>
                                <p className="text-body">Body - The quick brown fox jumps over the lazy dog</p>
                                <code className="text-caption text-neutral-500 font-mono">text-body</code>
                            </div>
                            <div>
                                <p className="text-body-sm">Body Small - The quick brown fox jumps over the lazy dog</p>
                                <code className="text-caption text-neutral-500 font-mono">text-body-sm</code>
                            </div>
                            <div>
                                <p className="text-body-xs">Body Extra Small - The quick brown fox jumps over the lazy dog</p>
                                <code className="text-caption text-neutral-500 font-mono">text-body-xs</code>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============================================
            BUTTONS
            ============================================ */}
                <section id="buttons" className="scroll-mt-24">
                    <h2 className="text-h2 font-semibold text-neutral-900 mb-6">Buttons</h2>

                    {/* Button Variants */}
                    <div className="bg-white rounded-xl p-8 border border-neutral-200 mb-6">
                        <h3 className="text-h3 font-semibold text-neutral-800 mb-6">Variants</h3>
                        <div className="flex flex-wrap gap-4">
                            <button className={buttonVariants({ variant: 'primary' })}>Primary</button>
                            <button className={buttonVariants({ variant: 'secondary' })}>Secondary</button>
                            <button className={buttonVariants({ variant: 'outline' })}>Outline</button>
                            <button className={buttonVariants({ variant: 'ghost' })}>Ghost</button>
                            <button className={buttonVariants({ variant: 'success' })}>Success</button>
                            <button className={buttonVariants({ variant: 'warning' })}>Warning</button>
                            <button className={buttonVariants({ variant: 'danger' })}>Danger</button>
                            <button className={buttonVariants({ variant: 'link' })}>Link</button>
                        </div>
                    </div>

                    {/* Button Sizes */}
                    <div className="bg-white rounded-xl p-8 border border-neutral-200">
                        <h3 className="text-h3 font-semibold text-neutral-800 mb-6">Sizes</h3>
                        <div className="flex flex-wrap items-center gap-4">
                            <button className={buttonVariants({ size: 'sm' })}>Small</button>
                            <button className={buttonVariants({ size: 'md' })}>Medium</button>
                            <button className={buttonVariants({ size: 'lg' })}>Large</button>
                            <button className={buttonVariants({ size: 'xl' })}>Extra Large</button>
                        </div>
                    </div>
                </section>

                {/* ============================================
            BADGES
            ============================================ */}
                <section id="badges" className="scroll-mt-24">
                    <h2 className="text-h2 font-semibold text-neutral-900 mb-6">Badges</h2>

                    <div className="bg-white rounded-xl p-8 border border-neutral-200">
                        <div className="flex flex-wrap gap-3">
                            <span className={badgeVariants({ variant: 'default' })}>Default</span>
                            <span className={badgeVariants({ variant: 'primary' })}>Primary</span>
                            <span className={badgeVariants({ variant: 'success' })}>Success</span>
                            <span className={badgeVariants({ variant: 'warning' })}>Warning</span>
                            <span className={badgeVariants({ variant: 'error' })}>Error</span>
                            <span className={badgeVariants({ variant: 'info' })}>Info</span>
                        </div>
                    </div>
                </section>

                {/* ============================================
            CARDS
            ============================================ */}
                <section id="cards" className="scroll-mt-24">
                    <h2 className="text-h2 font-semibold text-neutral-900 mb-6">Cards</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className={cardVariants({ variant: 'default' })}>
                            <h4 className="text-h4 mb-2">Default Card</h4>
                            <p className="text-body-sm text-neutral-600">Border and white background</p>
                        </div>

                        <div className={cardVariants({ variant: 'elevated' })}>
                            <h4 className="text-h4 mb-2">Elevated Card</h4>
                            <p className="text-body-sm text-neutral-600">Shadow for emphasis</p>
                        </div>

                        <div className={cardVariants({ variant: 'interactive' })}>
                            <h4 className="text-h4 mb-2">Interactive Card</h4>
                            <p className="text-body-sm text-neutral-600">Hover for interaction</p>
                        </div>
                    </div>
                </section>

                {/* ============================================
            INPUTS
            ============================================ */}
                <section id="inputs" className="scroll-mt-24">
                    <h2 className="text-h2 font-semibold text-neutral-900 mb-6">Inputs</h2>

                    <div className="bg-white rounded-xl p-8 border border-neutral-200 space-y-4">
                        <div>
                            <label className="text-label block mb-2">Default Input</label>
                            <input
                                type="text"
                                placeholder="Enter text..."
                                className={inputVariants({ variant: 'default' })}
                            />
                        </div>

                        <div>
                            <label className="text-label block mb-2">Filled Input</label>
                            <input
                                type="text"
                                placeholder="Enter text..."
                                className={inputVariants({ variant: 'filled' })}
                            />
                        </div>

                        <div>
                            <label className="text-label block mb-2">Error Input</label>
                            <input
                                type="text"
                                placeholder="Enter text..."
                                className={inputVariants({ variant: 'error' })}
                            />
                            <p className="text-body-xs text-error mt-1">This field has an error</p>
                        </div>
                    </div>
                </section>

                {/* ============================================
            ALERTS
            ============================================ */}
                <section id="alerts" className="scroll-mt-24">
                    <h2 className="text-h2 font-semibold text-neutral-900 mb-6">Alerts</h2>

                    <div className="space-y-4">
                        <div className={alertVariants({ variant: 'info' })}>
                            <p className="font-semibold mb-1">Information</p>
                            <p className="text-body-sm">This is an informational message for the user.</p>
                        </div>

                        <div className={alertVariants({ variant: 'success' })}>
                            <p className="font-semibold mb-1">Success</p>
                            <p className="text-body-sm">Your action was completed successfully!</p>
                        </div>

                        <div className={alertVariants({ variant: 'warning' })}>
                            <p className="font-semibold mb-1">Warning</p>
                            <p className="text-body-sm">Please review this before proceeding.</p>
                        </div>

                        <div className={alertVariants({ variant: 'error' })}>
                            <p className="font-semibold mb-1">Error</p>
                            <p className="text-body-sm">Something went wrong. Please try again.</p>
                        </div>
                    </div>
                </section>

                {/* ============================================
            SPACING
            ============================================ */}
                <section id="spacing" className="scroll-mt-24">
                    <h2 className="text-h2 font-semibold text-neutral-900 mb-6">Spacing Scale</h2>

                    <div className="bg-white rounded-xl p-8 border border-neutral-200">
                        <div className="space-y-4">
                            {Object.entries(spacing).filter(([key]) => !isNaN(Number(key))).slice(0, 15).map(([key, value]) => (
                                <div key={key} className="flex items-center gap-4">
                                    <div className="w-20 text-body-sm font-mono text-neutral-600">
                                        space-{key}
                                    </div>
                                    <div
                                        className="bg-brand-500"
                                        style={{ width: value, height: '1.5rem' }}
                                    />
                                    <div className="text-body-sm text-neutral-500 font-mono">{value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ============================================
            SHADOWS
            ============================================ */}
                <section id="shadows" className="scroll-mt-24">
                    <h2 className="text-h2 font-semibold text-neutral-900 mb-6">Shadows</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(shadows).filter(([key]) => key !== 'none' && key !== 'inner').map(([name, shadow]) => (
                            <div key={name} className="bg-white rounded-xl p-8 border border-neutral-200">
                                <div
                                    className="bg-white rounded-lg p-6 mb-3"
                                    style={{ boxShadow: shadow }}
                                >
                                    <div className="h-16 flex items-center justify-center text-neutral-500">
                                        Shadow Preview
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="font-medium text-neutral-900">shadow-{name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ============================================
            USAGE GUIDE
            ============================================ */}
                <section id="usage" className="scroll-mt-24">
                    <h2 className="text-h2 font-semibold text-neutral-900 mb-6">Usage Guide</h2>

                    <div className="bg-white rounded-xl p-8 border border-neutral-200 space-y-6">
                        <div>
                            <h3 className="text-h3 font-semibold text-neutral-800 mb-3">Using Design Tokens</h3>
                            <div className="bg-neutral-50 rounded-lg p-4 font-mono text-body-sm">
                                <code className="text-brand-600">
                                    {`import { colors, typography } from '@/lib/design-system/tokens';`}
                                </code>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-h3 font-semibold text-neutral-800 mb-3">Using Component Variants</h3>
                            <div className="bg-neutral-50 rounded-lg p-4 font-mono text-body-sm space-y-2">
                                <code className="text-brand-600 block">
                                    {`import { buttonVariants } from '@/lib/design-system/variants';`}
                                </code>
                                <code className="text-neutral-700 block">
                                    {`<button className={buttonVariants({ variant: 'primary', size: 'lg' })}>`}
                                </code>
                                <code className="text-neutral-700 block ml-4">
                                    {`  Click me`}
                                </code>
                                <code className="text-neutral-700 block">
                                    {`</button>`}
                                </code>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-h3 font-semibold text-neutral-800 mb-3">Using Tailwind Classes</h3>
                            <div className="bg-neutral-50 rounded-lg p-4 font-mono text-body-sm">
                                <code className="text-neutral-700">
                                    {`<div className="bg-brand-600 text-white p-6 rounded-xl shadow-lg">`}
                                </code>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

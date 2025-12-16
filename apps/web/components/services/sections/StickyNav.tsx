'use client'

import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface StickyNavItem {
    id: string
    label: string
}

interface StickyNavProps {
    items: StickyNavItem[]
    className?: string
}

export function StickyNav({ items, className }: StickyNavProps) {
    const [activeSection, setActiveSection] = useState(items[0]?.id || '')
    const observerRef = useRef<IntersectionObserver | null>(null)

    useEffect(() => {
        // Create intersection observer to track which section is in view
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id)
                    }
                })
            },
            {
                rootMargin: '-100px 0px -60% 0px',
                threshold: 0
            }
        )

        // Observe all sections
        items.forEach((item) => {
            const element = document.getElementById(item.id)
            if (element && observerRef.current) {
                observerRef.current.observe(element)
            }
        })

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect()
            }
        }
    }, [items])

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id)
        if (element) {
            const offset = 100 // Account for sticky header
            const top = element.getBoundingClientRect().top + window.scrollY - offset
            window.scrollTo({ top, behavior: 'smooth' })
        }
    }

    return (
        <nav className={cn('space-y-1', className)}>
            {items.map((item) => (
                <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={cn(
                        'w-full text-left px-4 py-2.5 text-sm rounded-lg transition-colors',
                        activeSection === item.id
                            ? 'bg-brand-50 text-brand-700 font-medium border-l-2 border-brand-600'
                            : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                    )}
                >
                    {item.label}
                </button>
            ))}
        </nav>
    )
}

// Mobile version - horizontal scrollable tabs
export function StickyNavMobile({ items, className }: StickyNavProps) {
    const [activeSection, setActiveSection] = useState(items[0]?.id || '')
    const navRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id)
                    }
                })
            },
            {
                rootMargin: '-80px 0px -70% 0px',
                threshold: 0
            }
        )

        items.forEach((item) => {
            const element = document.getElementById(item.id)
            if (element) {
                observer.observe(element)
            }
        })

        return () => observer.disconnect()
    }, [items])

    // Scroll active tab into view
    useEffect(() => {
        const activeButton = navRef.current?.querySelector(`[data-section="${activeSection}"]`)
        if (activeButton) {
            activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
        }
    }, [activeSection])

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id)
        if (element) {
            const offset = 140 // Account for sticky header + mobile nav
            const top = element.getBoundingClientRect().top + window.scrollY - offset
            window.scrollTo({ top, behavior: 'smooth' })
        }
    }

    return (
        <div
            ref={navRef}
            className={cn(
                'flex gap-2 overflow-x-auto scrollbar-hide py-2 px-4 -mx-4',
                className
            )}
        >
            {items.map((item) => (
                <button
                    key={item.id}
                    data-section={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={cn(
                        'px-4 py-2 text-sm rounded-full whitespace-nowrap transition-colors flex-shrink-0',
                        activeSection === item.id
                            ? 'bg-brand-600 text-white font-medium'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    )}
                >
                    {item.label}
                </button>
            ))}
        </div>
    )
}

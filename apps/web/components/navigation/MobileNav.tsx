'use client'

import Link from 'next/link'
import { Menu, X, ChevronDown } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { NavigationParent } from '@/types/service'

interface MobileNavProps {
    parentCategories: NavigationParent[]
    isOpen: boolean
    onClose: () => void
}

export function MobileNav({ parentCategories, isOpen, onClose }: MobileNavProps) {
    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="left" className="w-[300px] p-0">
                <SheetHeader className="border-b px-6 py-4">
                    <SheetTitle>Menu</SheetTitle>
                </SheetHeader>

                <div className="overflow-y-auto h-[calc(100vh-80px)] px-4 py-4">
                    <Accordion type="single" collapsible className="w-full">
                        {/* Parent Categories */}
                        {parentCategories.map((parentCat) => (
                            <AccordionItem
                                key={parentCat.id}
                                value={parentCat.id}
                            >
                                <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                                    <div className="flex items-center gap-2">
                                        <span>{parentCat.title}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    {/* Sub-categories */}
                                    <Accordion type="single" collapsible className="w-full pl-4">
                                        {parentCat.children?.map((subCat) => (
                                            <AccordionItem
                                                key={subCat.id}
                                                value={subCat.id}
                                            >
                                                <AccordionTrigger className="text-sm py-2 hover:no-underline">
                                                    {subCat.title}
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <ul className="space-y-2 pl-4">
                                                        {subCat.services.map((service) => (
                                                            <li key={service.slug}>
                                                                <Link
                                                                    href={`${subCat.href}/${service.slug}`}
                                                                    onClick={onClose}
                                                                    className="text-sm text-muted-foreground hover:text-foreground block py-1"
                                                                >
                                                                    {service.title}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                        {subCat.services.length > 0 && (
                                                            <li>
                                                                <Link
                                                                    href={subCat.href}
                                                                    onClick={onClose}
                                                                    className="text-sm text-primary hover:underline block py-1 font-medium"
                                                                >
                                                                    View all →
                                                                </Link>
                                                            </li>
                                                        )}
                                                    </ul>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>

                    {/* CTA Buttons */}
                    <div className="mt-6 space-y-3 pb-6 border-t pt-4">
                        {/* Consult Expert - Prominent CTA for mobile */}
                        <Link href="/consult-expert" onClick={onClose}>
                            <Button className="w-full bg-brand-600 hover:bg-brand-700">
                                Consult Expert
                            </Button>
                        </Link>
                        <Link href="/login" onClick={onClose}>
                            <Button variant="outline" className="w-full">
                                Login
                            </Button>
                        </Link>
                        <Link href="/signup" onClick={onClose}>
                            <Button variant="secondary" className="w-full">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export function MobileNavTrigger({ onClick, className }: { onClick: () => void; className?: string }) {
    return (
        <Button variant="ghost" size="icon" onClick={onClick} className={className}>
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
        </Button>
    )
}

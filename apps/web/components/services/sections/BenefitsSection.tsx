import { BenefitsSection as BenefitsType } from '@/data/services'
import * as LucideIcons from 'lucide-react'

// Dynamic icon lookup from lucide-react
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    // Common icons
    Shield: LucideIcons.Shield,
    Clock: LucideIcons.Clock,
    Users: LucideIcons.Users,
    User: LucideIcons.User,
    Award: LucideIcons.Award,
    HeadphonesIcon: LucideIcons.HeadphonesIcon,
    FileCheck: LucideIcons.FileCheck,
    Zap: LucideIcons.Zap,
    CheckCircle: LucideIcons.CheckCircle,
    Star: LucideIcons.Star,
    TrendingUp: LucideIcons.TrendingUp,
    Lock: LucideIcons.Lock,
    Sparkles: LucideIcons.Sparkles,
    // Additional icons used in services
    Search: LucideIcons.Search,
    FileText: LucideIcons.FileText,
    ClipboardCheck: LucideIcons.ClipboardCheck,
    Scale: LucideIcons.Scale,
    Newspaper: LucideIcons.Newspaper,
    GraduationCap: LucideIcons.GraduationCap,
    Bell: LucideIcons.Bell,
    HeartHandshake: LucideIcons.HeartHandshake,
    Heart: LucideIcons.Heart,
    Building: LucideIcons.Building,
    Building2: LucideIcons.Building2,
    Landmark: LucideIcons.Landmark,
    Globe: LucideIcons.Globe,
    Store: LucideIcons.Store,
    Handshake: LucideIcons.Handshake,
    Package: LucideIcons.Package,
    Briefcase: LucideIcons.Briefcase,
    BadgeCheck: LucideIcons.BadgeCheck,
    Box: LucideIcons.Box,
    Palette: LucideIcons.Palette,
    Volume2: LucideIcons.Volume2,
    Paintbrush: LucideIcons.Paintbrush,
    Factory: LucideIcons.Factory,
    Layers: LucideIcons.Layers,
    ShieldCheck: LucideIcons.ShieldCheck,
    Send: LucideIcons.Send,
    Gift: LucideIcons.Gift,
    Banknote: LucideIcons.Banknote,
    BadgePercent: LucideIcons.BadgePercent,
    UtensilsCrossed: LucideIcons.UtensilsCrossed,
    ChefHat: LucideIcons.ChefHat,
    Truck: LucideIcons.Truck,
    Warehouse: LucideIcons.Warehouse,
    Milk: LucideIcons.Milk,
    Upload: LucideIcons.Upload,
    CreditCard: LucideIcons.CreditCard,
    ShoppingCart: LucideIcons.ShoppingCart,
    UserPlus: LucideIcons.UserPlus,
    Infinity: LucideIcons.Infinity,
    DollarSign: LucideIcons.DollarSign,
    Hospital: LucideIcons.Hospital,
    Ticket: LucideIcons.Ticket,
}

// Fallback function to get icon from lucide-react dynamically
function getIcon(iconName?: string): React.ComponentType<{ className?: string }> {
    if (!iconName) return LucideIcons.CheckCircle
    return iconMap[iconName] || (LucideIcons as any)[iconName] || LucideIcons.CheckCircle
}

interface BenefitsSectionProps {
    data: BenefitsType
}

export function BenefitsSection({ data }: BenefitsSectionProps) {
    return (
        <section id="why-us" className="scroll-mt-28">
            <h2 className="text-2xl font-bold text-neutral-900 mb-3">{data.title}</h2>

            {data.description && (
                <p className="text-neutral-600 mb-6">{data.description}</p>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
                {data.items.map((item, i) => {
                    const IconComponent = getIcon(item.icon)

                    return (
                        <div
                            key={i}
                            className="p-5 bg-gradient-to-br from-brand-50/50 to-white rounded-xl border border-brand-100/50"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    {IconComponent && <IconComponent className="h-5 w-5 text-brand-600" />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-neutral-900 mb-1">{item.title}</h3>
                                    <p className="text-sm text-neutral-600 leading-relaxed">{item.description}</p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 py-6 bg-neutral-50 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <LucideIcons.Shield className="h-5 w-5 text-green-600" />
                    <span>100% Secure</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <LucideIcons.Award className="h-5 w-5 text-amber-500" />
                    <span>Expert Support</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <LucideIcons.Clock className="h-5 w-5 text-brand-600" />
                    <span>Quick Processing</span>
                </div>
            </div>
        </section>
    )
}

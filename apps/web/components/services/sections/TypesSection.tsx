import { TypesSection as TypesType } from '@/data/services'
import {
    Package, Briefcase, BadgeCheck, Users, Box, Palette,
    Volume2, Paintbrush, FileText, Award, User, Building,
    Landmark, Globe, Calendar, GitBranch, ShoppingBag,
    ShoppingCart, Factory, UtensilsCrossed, AlertTriangle,
    TrendingUp, Layers, GitCompare, FileOutput, FileInput
} from 'lucide-react'

// Icon mapping - comprehensive list for all type items
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    // Trademark types
    Package,
    Briefcase,
    BadgeCheck,
    Users,
    Box,
    Palette,
    Volume2,
    Paintbrush,
    // Common
    FileText,
    Award,
    User,
    Building,
    Landmark,
    Globe,
    // GST types
    Calendar,
    GitBranch,
    ShoppingBag,
    ShoppingCart,
    // License types
    Factory,
    UtensilsCrossed,
    AlertTriangle,
    // MSME types
    TrendingUp,
    Layers,
    // GST Filing types
    GitCompare,
    FileOutput,
    FileInput
}

interface TypesSectionProps {
    data: TypesType
}

export function TypesSection({ data }: TypesSectionProps) {
    return (
        <section id="types" className="scroll-mt-28">
            <h2 className="text-2xl font-bold text-neutral-900 mb-3">{data.title}</h2>

            {data.description && (
                <p className="text-neutral-600 mb-6">{data.description}</p>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {data.items.map((item, i) => {
                    const IconComponent = item.icon ? iconMap[item.icon] : FileText

                    return (
                        <div
                            key={i}
                            className="group p-5 bg-white rounded-xl border border-neutral-200 hover:border-brand-200 hover:shadow-sm transition-all"
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon or Image */}
                                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 transition-colors">
                                    {IconComponent && <IconComponent className="h-6 w-6 text-brand-600" />}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-semibold text-neutral-900 mb-1">
                                        {item.name}
                                    </h3>
                                    <p className="text-sm text-neutral-600 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

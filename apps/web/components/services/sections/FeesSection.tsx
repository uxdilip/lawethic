import { FeesSection as FeesType } from '@/data/services'
import { IndianRupee } from 'lucide-react'

interface FeesSectionProps {
    data: FeesType
}

export function FeesSection({ data }: FeesSectionProps) {
    return (
        <section id="fees" className="scroll-mt-28">
            <h2 className="text-2xl font-bold text-neutral-900 mb-3">{data.title}</h2>

            {data.description && (
                <p className="text-neutral-600 mb-6">{data.description}</p>
            )}

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-neutral-200">
                <table className="w-full">
                    <thead>
                        <tr className="bg-neutral-50">
                            <th className="text-left p-4 text-sm font-semibold text-neutral-700 border-b border-neutral-200">
                                Entity Type
                            </th>
                            {data.table[0]?.eFiling && (
                                <th className="text-left p-4 text-sm font-semibold text-neutral-700 border-b border-neutral-200">
                                    E-Filing Fee
                                </th>
                            )}
                            {data.table[0]?.physical && (
                                <th className="text-left p-4 text-sm font-semibold text-neutral-700 border-b border-neutral-200">
                                    Physical Filing Fee
                                </th>
                            )}
                            <th className="text-left p-4 text-sm font-semibold text-neutral-700 border-b border-neutral-200">
                                Notes
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.table.map((row, i) => (
                            <tr
                                key={i}
                                className={i % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'}
                            >
                                <td className="p-4 text-sm font-medium text-neutral-900 border-b border-neutral-100">
                                    {row.entityType}
                                </td>
                                {row.eFiling && (
                                    <td className="p-4 text-sm text-neutral-700 border-b border-neutral-100">
                                        <span className="inline-flex items-center gap-1">
                                            <IndianRupee className="h-3.5 w-3.5" />
                                            {row.eFiling}
                                        </span>
                                    </td>
                                )}
                                {row.physical && (
                                    <td className="p-4 text-sm text-neutral-700 border-b border-neutral-100">
                                        <span className="inline-flex items-center gap-1">
                                            <IndianRupee className="h-3.5 w-3.5" />
                                            {row.physical}
                                        </span>
                                    </td>
                                )}
                                <td className="p-4 text-sm text-neutral-600 border-b border-neutral-100">
                                    {row.notes || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {data.table.map((row, i) => (
                    <div
                        key={i}
                        className="p-4 bg-white rounded-xl border border-neutral-200"
                    >
                        <h4 className="font-semibold text-neutral-900 mb-3">{row.entityType}</h4>
                        <div className="space-y-2 text-sm">
                            {row.eFiling && (
                                <div className="flex justify-between">
                                    <span className="text-neutral-500">E-Filing</span>
                                    <span className="font-medium text-neutral-900 flex items-center gap-1">
                                        <IndianRupee className="h-3 w-3" />
                                        {row.eFiling}
                                    </span>
                                </div>
                            )}
                            {row.physical && (
                                <div className="flex justify-between">
                                    <span className="text-neutral-500">Physical</span>
                                    <span className="font-medium text-neutral-900 flex items-center gap-1">
                                        <IndianRupee className="h-3 w-3" />
                                        {row.physical}
                                    </span>
                                </div>
                            )}
                            {row.notes && (
                                <p className="text-neutral-600 pt-2 border-t border-neutral-100">
                                    {row.notes}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

        </section>
    )
}

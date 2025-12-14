'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, CheckSquare } from 'lucide-react'
import { DocumentGroup } from '@/types/service-content'

interface DocumentsChecklistProps {
    documents: DocumentGroup[]
}

export function DocumentsChecklist({ documents }: DocumentsChecklistProps) {
    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-5xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl font-bold mb-4">Documents Required</h2>
                    <p className="text-gray-600 text-lg">
                        Here's what you'll need to get started
                    </p>
                </motion.div>

                {documents.length === 1 ? (
                    // Single group - no tabs
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <Card className="p-8">
                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <FileText className="w-6 h-6 text-blue-600" />
                                {documents[0].applicantType}
                            </h3>

                            <ul className="grid md:grid-cols-2 gap-4">
                                {documents[0].items.map((item, idx) => (
                                    <motion.li
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="flex items-start gap-3"
                                    >
                                        <CheckSquare className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </Card>
                    </motion.div>
                ) : (
                    // Multiple groups - with tabs
                    <Tabs defaultValue={documents[0].applicantType} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-8">
                            {documents.map((group) => (
                                <TabsTrigger key={group.applicantType} value={group.applicantType}>
                                    {group.applicantType}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {documents.map((group) => (
                            <TabsContent key={group.applicantType} value={group.applicantType}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <Card className="p-8">
                                        <ul className="grid md:grid-cols-2 gap-4">
                                            {group.items.map((item, idx) => (
                                                <motion.li
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="flex items-start gap-3"
                                                >
                                                    <CheckSquare className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                    <span>{item}</span>
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </Card>
                                </motion.div>
                            </TabsContent>
                        ))}
                    </Tabs>
                )}
            </div>
        </section>
    )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle } from 'lucide-react'

interface LeadCaptureFormProps {
    title?: string
    ctaText?: string
    serviceName: string
    serviceSlug: string
    onSuccess?: () => void
}

export function LeadCaptureForm({
    title = 'Get Started Today!',
    ctaText = 'Get Started',
    serviceName,
    serviceSlug,
    onSuccess
}: LeadCaptureFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        city: ''
    })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    service: serviceName,
                    serviceSlug,
                    source: 'service_page'
                })
            })

            if (!response.ok) {
                throw new Error('Failed to submit')
            }

            setSuccess(true)
            onSuccess?.()
        } catch (err) {
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
                <div className="text-center py-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">Thank You!</h3>
                    <p className="text-sm text-neutral-600">
                        Our expert will call you within 30 minutes.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">{title}</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <input
                        type="text"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <input
                        type="tel"
                        placeholder="Mobile Number"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        required
                        pattern="[0-9]{10}"
                        className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <input
                        type="text"
                        placeholder="City / Pincode"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                </div>

                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg font-medium"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Submitting...
                        </>
                    ) : (
                        ctaText
                    )}
                </Button>

                <p className="text-xs text-neutral-500 text-center">
                    By submitting, you agree to our Terms & Privacy Policy
                </p>
            </form>
        </div>
    )
}

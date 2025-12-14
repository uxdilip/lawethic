'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface LeadCaptureFormProps {
    service: string;
    category: string;
    selectedPackage?: string;
}

export function LeadCaptureForm({ service, category, selectedPackage }: LeadCaptureFormProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        city: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    service,
                    category,
                    package: selectedPackage || 'Basic',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit lead');
            }

            toast({
                title: 'Thank you!',
                description: 'Our team will contact you within 24 hours.',
            });

            // Reset form
            setFormData({
                name: '',
                email: '',
                phone: '',
                city: '',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to submit. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-lg">
            <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">Get Started Today</h3>
                <p className="text-sm text-gray-600">Fill in your details and our expert will reach out to you</p>
            </div>

            <div className="space-y-4">
                <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1"
                    />
                </div>

                <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="mt-1"
                    />
                </div>

                <div>
                    <Label htmlFor="phone">Mobile Number *</Label>
                    <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="mt-1"
                    />
                </div>

                <div>
                    <Label htmlFor="city">City / Pincode *</Label>
                    <Input
                        id="city"
                        name="city"
                        type="text"
                        placeholder="Enter your city or pincode"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="mt-1"
                    />
                </div>
            </div>

            <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Submitting...' : 'Get Started Now'}
            </Button>

            <p className="text-xs text-gray-500 text-center">
                By submitting, you agree to our terms and privacy policy
            </p>
        </form>
    );
}

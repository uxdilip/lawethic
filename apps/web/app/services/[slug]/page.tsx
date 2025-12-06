'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { databases, appwriteConfig, account } from '@lawethic/appwrite';
import { Service } from '@lawethic/appwrite/types';
import { CheckCircle, Clock, FileText, ArrowRight } from 'lucide-react';
import { Query } from 'appwrite';
import Header from '@/components/Header';

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
    const router = useRouter();
    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchService();
    }, [params.slug]);

    const fetchService = async () => {
        try {
            const response = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.services,
                [Query.equal('slug', params.slug), Query.limit(1)]
            );

            if (response.documents.length === 0) {
                setError('Service not found');
            } else {
                setService(response.documents[0] as unknown as Service);
            }
        } catch (err: any) {
            setError('Failed to load service');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStartApplication = async () => {
        try {
            // Check if user is logged in
            await account.get();
            // User is logged in, proceed to checkout
            router.push(`/checkout?serviceId=${service?.$id}`);
        } catch (error) {
            // User not logged in, redirect to signup
            router.push(`/signup?redirect=/checkout?serviceId=${service?.$id}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (error || !service) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h1>
                    <Link href="/services" className="text-blue-600 hover:underline">
                        Back to Services
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Service Detail */}
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="md:col-span-2">
                            <div className="mb-4">
                                <Link href="/services" className="text-blue-600 hover:underline flex items-center">
                                    ← Back to Services
                                </Link>
                            </div>
                            <div className="bg-white rounded-lg shadow-lg p-8">
                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full mb-4">
                                    {service.category}
                                </span>
                                <h1 className="text-4xl font-bold text-gray-900 mb-4">{service.name}</h1>
                                <p className="text-xl text-gray-600 mb-6">{service.shortDescription}</p>

                                <div className="prose max-w-none mb-8">
                                    <h2 className="text-2xl font-semibold mb-4">About this service</h2>
                                    <p className="text-gray-700 whitespace-pre-line">{service.description}</p>
                                </div>

                                {service.features && service.features.length > 0 && (
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-semibold mb-4">What's included</h2>
                                        <ul className="space-y-3">
                                            {service.features.map((feature, index) => (
                                                <li key={index} className="flex items-start">
                                                    <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-700">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {service.documentRequired && service.documentRequired.length > 0 && (
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-semibold mb-4">Required Documents</h2>
                                        <ul className="space-y-3">
                                            {service.documentRequired.map((doc, index) => (
                                                <li key={index} className="flex items-start">
                                                    <FileText className="h-6 w-6 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-700">{doc}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="md:col-span-1">
                            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
                                <div className="mb-6">
                                    <div className="text-3xl font-bold text-blue-600 mb-2">
                                        ₹{service.price.toLocaleString()}
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <Clock className="h-5 w-5 mr-2" />
                                        <span>{service.estimatedDays}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleStartApplication}
                                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center"
                                >
                                    Start Application
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </button>

                                <div className="mt-6 pt-6 border-t">
                                    <h3 className="font-semibold mb-3">Why choose us?</h3>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li className="flex items-start">
                                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                            <span>100% manual filing by experts</span>
                                        </li>
                                        <li className="flex items-start">
                                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                            <span>Quick processing time</span>
                                        </li>
                                        <li className="flex items-start">
                                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                            <span>Real-time status tracking</span>
                                        </li>
                                        <li className="flex items-start">
                                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                            <span>Dedicated support</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

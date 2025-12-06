'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { databases, appwriteConfig } from '@lawethic/appwrite';
import { Service } from '@lawethic/appwrite/types';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Query } from 'appwrite';
import Header from '@/components/Header';

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.services,
                [Query.orderDesc('$createdAt')]
            );
            setServices(response.documents as unknown as Service[]);
        } catch (err: any) {
            setError('Failed to load services');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Hero */}
            <section className="bg-blue-600 text-white py-16 px-4">
                <div className="container mx-auto text-center max-w-3xl">
                    <h1 className="text-4xl font-bold mb-4">Our Services</h1>
                    <p className="text-xl text-blue-100">
                        Professional compliance services handled by experienced CA/CS professionals
                    </p>
                </div>
            </section>

            {/* Services Grid */}
            <section className="container mx-auto px-4 py-12">
                {loading && (
                    <div className="text-center py-12">
                        <div className="text-lg text-gray-600">Loading services...</div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {!loading && !error && services.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-600">No services available at the moment</p>
                    </div>
                )}

                {!loading && !error && services.length > 0 && (
                    <div className="grid md:grid-cols-3 gap-8">
                        {services.map((service) => (
                            <div key={service.$id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                                <div className="p-6">
                                    <div className="mb-4">
                                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full">
                                            {service.category}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{service.name}</h3>
                                    <p className="text-gray-600 mb-4">{service.shortDescription}</p>
                                    <div className="mb-4">
                                        <span className="text-3xl font-bold text-blue-600">₹{service.price.toLocaleString()}</span>
                                    </div>
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500">
                                            <strong>Timeline:</strong> {service.estimatedDays}
                                        </p>
                                    </div>
                                    {service.features && service.features.length > 0 && (
                                        <ul className="space-y-2 mb-6">
                                            {service.features.slice(0, 3).map((feature, index) => (
                                                <li key={index} className="flex items-start">
                                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm text-gray-600">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    <Link
                                        href={`/services/${service.slug}`}
                                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        View Details
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

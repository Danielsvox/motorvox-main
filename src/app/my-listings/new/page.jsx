"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { API_BASE_URL } from '@/config/api';
import { useUser } from "@/contexts/UserContext";

export default function CreateListingPage() {
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: '',
        price: '',
        mileage: '',
        transmission: 'automatic',
        description: '',
        image: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
        // Redirect if user is not a seller
        if (user && !user.is_seller) {
            router.push('/');
            return;
        }
    }, [user, router]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Authentication required');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/listings/cars/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    year: parseInt(formData.year),
                    price: parseFloat(formData.price),
                    mileage: formData.mileage ? parseInt(formData.mileage) : null
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create listing');
            }

            const newListing = await response.json();
            router.push(`/my-listings/${newListing.id}`);
        } catch (err) {
            setError(err.message || 'Failed to create listing');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="flex justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!user.is_seller) {
        return (
            <div className="flex justify-center py-16">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
                    <p className="text-gray-600">You need seller privileges to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <main className="flex-1">
            <section className="bg-gradient-to-r from-primary to-primary-foreground py-20">
                <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h1 className="text-4xl font-bold text-primary-foreground sm:text-5xl">
                            Create New Listing
                        </h1>
                        <p className="mt-4 text-lg text-primary-foreground/90">
                            Add your car to our marketplace.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-16">
                <div className="container mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    <Button
                        onClick={() => router.push('/my-listings')}
                        variant="outline"
                        className="mb-8 flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to My Listings
                    </Button>

                    <Card>
                        <CardHeader>
                            <CardTitle>Car Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="make">Make *</Label>
                                        <Input
                                            id="make"
                                            name="make"
                                            type="text"
                                            value={formData.make}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="e.g., Toyota"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="model">Model *</Label>
                                        <Input
                                            id="model"
                                            name="model"
                                            type="text"
                                            value={formData.model}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="e.g., Camry"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <Label htmlFor="year">Year *</Label>
                                        <Input
                                            id="year"
                                            name="year"
                                            type="number"
                                            value={formData.year}
                                            onChange={handleInputChange}
                                            required
                                            min="1900"
                                            max={new Date().getFullYear() + 1}
                                            placeholder="2020"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="price">Price *</Label>
                                        <Input
                                            id="price"
                                            name="price"
                                            type="number"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            required
                                            min="0"
                                            step="0.01"
                                            placeholder="25000"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="mileage">Mileage</Label>
                                        <Input
                                            id="mileage"
                                            name="mileage"
                                            type="number"
                                            value={formData.mileage}
                                            onChange={handleInputChange}
                                            min="0"
                                            placeholder="50000"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="transmission">Transmission</Label>
                                    <select
                                        id="transmission"
                                        name="transmission"
                                        value={formData.transmission}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        <option value="automatic">Automatic</option>
                                        <option value="manual">Manual</option>
                                        <option value="cvt">CVT</option>
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="image">Image URL</Label>
                                    <Input
                                        id="image"
                                        name="image"
                                        type="url"
                                        value={formData.image}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com/car-image.jpg"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Describe your car's condition, features, and any additional information..."
                                    />
                                </div>

                                {error && (
                                    <div className="text-red-500 text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.push('/my-listings')}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            'Create Listing'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </main>
    );
} 
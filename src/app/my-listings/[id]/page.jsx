"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Edit, Trash2, Save, X } from "lucide-react";
import { API_BASE_URL } from '@/config/api';
import { useUser } from "@/contexts/UserContext";

export default function ManageListingPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useUser();
    const listingId = params.id;

    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

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

    const fetchListing = useCallback(async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Authentication required');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/listings/cars/${listingId}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Listing not found');
                } else if (response.status === 403) {
                    throw new Error('You do not have permission to manage this listing');
                }
                throw new Error('Failed to fetch listing');
            }

            const data = await response.json();
            setListing(data);
            setFormData({
                make: data.make || '',
                model: data.model || '',
                year: data.year?.toString() || '',
                price: data.price?.toString() || '',
                mileage: data.mileage?.toString() || '',
                transmission: data.transmission || 'automatic',
                description: data.description || '',
                image: data.image || ''
            });
        } catch (err) {
            setError(err.message || 'Failed to load listing');
        } finally {
            setLoading(false);
        }
    }, [listingId]);

    useEffect(() => {
        // Redirect if user is not a seller
        if (user && !user.is_seller) {
            router.push('/');
            return;
        }

        // Only fetch if user is authenticated and is a seller
        if (user?.is_seller && listingId) {
            fetchListing();
        }
    }, [user, router, listingId, fetchListing]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);

        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Authentication required');
            setSaving(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/listings/cars/${listingId}/`, {
                method: 'PUT',
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
                throw new Error(errorData.message || 'Failed to update listing');
            }

            const updatedListing = await response.json();
            setListing(updatedListing);
            setIsEditing(false);
        } catch (err) {
            setError(err.message || 'Failed to update listing');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
            return;
        }

        setDeleting(true);
        setError(null);

        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Authentication required');
            setDeleting(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/listings/cars/${listingId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete listing');
            }

            router.push('/my-listings');
        } catch (err) {
            setError(err.message || 'Failed to delete listing');
            setDeleting(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center py-16">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={() => router.push('/my-listings')}>
                        Back to My Listings
                    </Button>
                </div>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="flex justify-center py-16">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Listing Not Found</h2>
                    <Button onClick={() => router.push('/my-listings')}>
                        Back to My Listings
                    </Button>
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
                            Manage Listing
                        </h1>
                        <p className="mt-4 text-lg text-primary-foreground/90">
                            {listing.make} {listing.model} ({listing.year})
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-16">
                <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <Button
                        onClick={() => router.push('/my-listings')}
                        variant="outline"
                        className="mb-8 flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to My Listings
                    </Button>

                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="lg:w-1/2">
                            <img
                                src={listing.image || "/placeholder.svg"}
                                alt={`${listing.make} ${listing.model}`}
                                className="rounded-lg object-cover w-full h-auto"
                            />
                        </div>
                        <div className="lg:w-1/2">
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>Listing Details</CardTitle>
                                        <div className="flex gap-2">
                                            {!isEditing ? (
                                                <Button
                                                    onClick={() => setIsEditing(true)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex items-center gap-2"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    Edit
                                                </Button>
                                            ) : (
                                                <>
                                                    <Button
                                                        onClick={() => setIsEditing(false)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex items-center gap-2"
                                                    >
                                                        <X className="h-4 w-4" />
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        onClick={handleSave}
                                                        disabled={saving}
                                                        size="sm"
                                                        className="flex items-center gap-2"
                                                    >
                                                        {saving ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Save className="h-4 w-4" />
                                                        )}
                                                        Save
                                                    </Button>
                                                </>
                                            )}
                                            <Button
                                                onClick={handleDelete}
                                                disabled={deleting}
                                                variant="destructive"
                                                size="sm"
                                                className="flex items-center gap-2"
                                            >
                                                {deleting ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {isEditing ? (
                                        <form className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="make">Make *</Label>
                                                    <Input
                                                        id="make"
                                                        name="make"
                                                        type="text"
                                                        value={formData.make}
                                                        onChange={handleInputChange}
                                                        required
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
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
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
                                                />
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <h3 className="text-sm text-muted-foreground">Make</h3>
                                                    <p className="font-medium">{listing.make}</p>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm text-muted-foreground">Model</h3>
                                                    <p className="font-medium">{listing.model}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <h3 className="text-sm text-muted-foreground">Year</h3>
                                                    <p className="font-medium">{listing.year}</p>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm text-muted-foreground">Price</h3>
                                                    <p className="font-medium">${parseFloat(listing.price).toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm text-muted-foreground">Mileage</h3>
                                                    <p className="font-medium">
                                                        {listing.mileage ? `${parseFloat(listing.mileage).toLocaleString()} miles` : "Not specified"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-sm text-muted-foreground">Transmission</h3>
                                                <p className="font-medium capitalize">{listing.transmission}</p>
                                            </div>

                                            <div>
                                                <h3 className="text-sm text-muted-foreground">Description</h3>
                                                <p className="text-gray-700">{listing.description || "No description provided."}</p>
                                            </div>

                                            <div>
                                                <h3 className="text-sm text-muted-foreground">Listed On</h3>
                                                <p className="font-medium">{formatDate(listing.created_at)}</p>
                                            </div>

                                            {listing.verification_status && (
                                                <div>
                                                    <h3 className="text-sm text-muted-foreground">Verification Status</h3>
                                                    <p className="font-medium capitalize">{listing.verification_status}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
} 
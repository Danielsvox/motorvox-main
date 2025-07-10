"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { API_BASE_URL } from '@/config/api';
import { useUser } from "@/contexts/UserContext";

export default function MyListingsPage() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
        // Redirect if user is not a seller
        if (user && !user.is_seller) {
            router.push('/');
            return;
        }

        // Only fetch if user is authenticated and is a seller
        if (user?.is_seller) {
            fetchMyListings();
        }
    }, [user, router]);

    const fetchMyListings = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Authentication required');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/listings/cars/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch listings');
            }

            const data = await response.json();
            // Filter to show only the current user's listings
            const myListings = data.results || data || [];
            setListings(myListings);
        } catch (err) {
            setError(err.message || 'Failed to load your listings');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        router.push('/my-listings/new');
    };

    const handleViewListing = (listingId) => {
        router.push(`/my-listings/${listingId}`);
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
                            My Listings
                        </h1>
                        <p className="mt-4 text-lg text-primary-foreground/90">
                            Manage your car listings and create new ones.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-16">
                <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold">Your Car Listings</h2>
                        <Button
                            onClick={handleCreateNew}
                            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            <Plus className="h-4 w-4" />
                            Create New Listing
                        </Button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-16">
                            <p className="text-red-500">{error}</p>
                            <Button
                                onClick={fetchMyListings}
                                className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                Try Again
                            </Button>
                        </div>
                    ) : listings.length === 0 ? (
                        <div className="text-center py-16">
                            <h3 className="text-xl font-semibold mb-4">No listings yet</h3>
                            <p className="text-gray-600 mb-6">Start by creating your first car listing.</p>
                            <Button
                                onClick={handleCreateNew}
                                className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                Create Your First Listing
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {listings.map((listing) => (
                                <Card
                                    key={listing.id}
                                    className="cursor-pointer hover:shadow-lg transition-shadow"
                                    onClick={() => handleViewListing(listing.id)}
                                >
                                    <img
                                        src={listing.image ? `${listing.image}` : "/placeholder.svg"}
                                        alt={`${listing.make} ${listing.model}`}
                                        width={400}
                                        height={300}
                                        className="rounded-t-lg object-cover"
                                        style={{ aspectRatio: "400/300", objectFit: "cover" }}
                                    />
                                    <CardContent className="p-6">
                                        <h3 className="text-xl font-bold">{listing.make} {listing.model}</h3>
                                        <p className="mt-2 text-muted-foreground">
                                            {listing.year} • {listing.mileage ? `${listing.mileage} miles` : "Mileage not available"}
                                        </p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-2xl font-bold">${listing.price}</span>
                                            <Button
                                                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                            >
                                                Manage
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
} 
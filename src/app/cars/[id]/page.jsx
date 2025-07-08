"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChatModal } from "@/components/ui/ChatModal";

export default function CarDetailsPage() {
  const params = useParams();
  const id = params.id;
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    console.log("Fetching car with ID:", id);
    if (id) {
      fetch(`/api/cars/${id}`)
        .then((response) => {
          console.log("Response status:", response.status);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Received car data:", data);
          setCar(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Failed to fetch car data:", error);
          setError(error.message);
          setLoading(false);
        });
    }
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>
  );

  if (error) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-lg text-red-500">Error: {error}</div>
    </div>
  );

  if (!car) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-lg">Car not found</div>
    </div>
  );

  const handleContactSeller = () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      // If not authenticated, show login modal
      // You might want to handle this through your auth context
      alert('Please log in to contact the seller');
      return;
    }
    setShowChat(true);
  };

  return (
    <main className="flex-1">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <a href="/" className="mb-4 text-blue-500 hover:underline inline-block">
          ← Back to Listings
        </a>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/2">
            <img
              src={car.image || "/placeholder.svg"}
              alt={`${car.make} ${car.model}`}
              className="rounded-lg object-cover w-full h-auto"
            />
          </div>
          <div className="lg:w-1/2">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">
                  {car.make} {car.model}
                </h1>
                <p className="text-2xl text-primary mt-2">${parseFloat(car.price).toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm text-muted-foreground">Year</h3>
                  <p className="font-medium">{car.year}</p>
                </div>
                <div>
                  <h3 className="text-sm text-muted-foreground">Mileage</h3>
                  <p className="font-medium">{parseFloat(car.mileage).toLocaleString()} miles</p>
                </div>
                <div>
                  <h3 className="text-sm text-muted-foreground">Transmission</h3>
                  <p className="font-medium capitalize">{car.transmission}</p>
                </div>
                <div>
                  <h3 className="text-sm text-muted-foreground">Listed On</h3>
                  <p className="font-medium">{formatDate(car.created_at)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm text-muted-foreground mb-2">Description</h3>
                <p className="text-gray-700">{car.description || "No description provided."}</p>
              </div>

              <div>
                <h3 className="text-sm text-muted-foreground mb-2">Seller Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">{car.seller_details.username}</p>
                  {(car.seller_details.first_name || car.seller_details.last_name) && (
                    <p className="text-sm text-gray-600">
                      {[car.seller_details.first_name, car.seller_details.last_name]
                        .filter(Boolean)
                        .join(' ')}
                    </p>
                  )}
                  <Button
                    onClick={handleContactSeller}
                    className="w-full mt-4"
                  >
                    Contact Seller
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ChatModal
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        sellerId={car.seller}
        sellerDetails={car.seller_details}
        carId={car.id}
        carTitle={`${car.make} ${car.model} (${car.year})`}
      />
    </main>
  );
} 
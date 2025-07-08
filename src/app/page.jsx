"use client";

import { useState, useEffect } from "react";
import CarList from "@/components/ui/carList";
import { API_BASE_URL } from '@/config/api';

export default function HomePage() {
  const [initialData, setInitialData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/listings/cars/`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to load cars');
        }
        setInitialData(data);
      })
      .catch((err) => setError(err.message || "Failed to load cars. Please try again later."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="flex-1">
      <section className="bg-gradient-to-r from-primary to-primary-foreground py-20">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold text-primary-foreground sm:text-5xl">
              Welcome to MotorVox
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/90">
              Browse our selection of certified pre-owned vehicles and find your dream car.
            </p>
          </div>
        </div>
      </section>
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <CarList initialData={initialData} error={error} />
      )}
    </main>
  );
}
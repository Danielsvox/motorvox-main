import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, useRef, useCallback } from "react";
import CarDetailModal from "@/components/ui/CarDetailModal";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { API_BASE_URL } from '@/config/api';

export default function CarList({ initialData, error: initialError }) {
  const [cars, setCars] = useState(initialData?.results || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError);
  const [hasMore, setHasMore] = useState(!!initialData?.next);
  const [page, setPage] = useState(1);

  const [showCarDetails, setShowCarDetails] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  const observer = useRef();
  const lastCarElementRef = useCallback(node => {
    if (loading) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreCars();
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const loadMoreCars = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/listings/cars/?page=${page + 1}`);
      const data = await response.json();

      if (response.ok) {
        setCars(prev => [...prev, ...data.results]);
        setHasMore(!!data.next);
        setPage(prev => prev + 1);
      } else {
        throw new Error(data.message || 'Failed to load more cars');
      }
    } catch (err) {
      setError('Error loading more cars: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (car) => {
    setSelectedCar(car);
    setShowCarDetails(true);
  };

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <section className="py-16">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {cars.map((car, index) => (
            <Card
              key={car.id}
              ref={cars.length === index + 1 ? lastCarElementRef : null}
            >
              <img
                src={car.image ? `${car.image}` : "placeholder.svg"}
                alt={`${car.make} ${car.model}`}
                width={400}
                height={300}
                className="rounded-t-lg object-cover"
                style={{ aspectRatio: "400/300", objectFit: "cover" }}
              />
              <CardContent className="p-6">
                <h3 className="text-xl font-bold">{car.make} {car.model}</h3>
                <p className="mt-2 text-muted-foreground">
                  {car.year} • {car.mileage ? `${car.mileage} miles` : "Mileage not available"}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-2xl font-bold">${car.price}</span>
                  <Button
                    onClick={() => handleViewDetails(car)}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center mt-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      {showCarDetails && selectedCar && (
        <CarDetailModal
          car={selectedCar}
          showCarDetails={showCarDetails}
          setShowCarDetails={setShowCarDetails}
        />
      )}
    </section>
  );
}

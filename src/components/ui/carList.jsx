import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import CarDetailModal from "@/components/ui/CarDetailModal";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export default function CarList({ cars, error }) {
  const [showCarDetails, setShowCarDetails] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

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
          {cars.map((car) => (
            <Card key={car.id}>
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

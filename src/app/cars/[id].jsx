// src/app/cars/[id].jsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";

export default function CarDetailsPage({ authToken, setAuthToken, setShowLoginModal, setShowSignUpModal, setShowAccountModal }) {
  const router = useRouter();
  const { id } = router.query;
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8000/listings/cars/${id}`)
        .then((response) => response.json())
        .then((data) => {
          setCar(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Failed to fetch car data:", error);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!car) return <div>Car not found</div>;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header
        authToken={authToken}
        setShowLoginModal={setShowLoginModal}
        setShowSignUpModal={setShowSignUpModal}
        setShowAccountModal={setShowAccountModal}
        handleLogout={() => {
          localStorage.removeItem("authToken");
          setAuthToken(null);
        }}
      />
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <button onClick={() => router.back()} className="mb-4 text-blue-500 hover:underline">
            ← Back to Listings
          </button>
          <div className="flex flex-col lg:flex-row gap-8">
            <img
              src={car.image || "/placeholder.svg"}
              alt={`${car.make} ${car.model}`}
              className="rounded-lg object-cover max-w-full lg:w-1/2"
            />
            <div className="lg:w-1/2">
              <h1 className="text-3xl font-bold">
                {car.make} {car.model} ({car.year})
              </h1>
              <p className="mt-2 text-muted-foreground">
                {car.mileage ? `${car.mileage} miles` : "Mileage not available"}
              </p>
              <p className="text-4xl font-bold text-primary mt-4">${car.price}</p>
              <p className="mt-6">{car.description || "No description provided."}</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CarDetailModal({ car, showCarDetails, setShowCarDetails }) {
  return (
    <Dialog open={showCarDetails} onOpenChange={setShowCarDetails}>
      <DialogContent className="max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{car.make} {car.model}</DialogTitle>
          <DialogDescription>{car.year} • {car.mileage ? `${car.mileage} miles` : "Mileage not available"}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <img
            src={car.image || "placeholder.svg"}
            alt={`${car.make} ${car.model}`}
            className="rounded-lg object-cover w-full h-auto"
            style={{ aspectRatio: "16/9" }}
          />
          <p className="mt-4">{car.description || "No description provided."}</p>
          <p className="mt-2 font-bold">Price: ${car.price}</p>
        </div>
        <Link href={`/cars/${car.id}`} passHref>
          <Button className="w-full mt-4 bg-primary text-white hover:bg-primary/90">
            View Full Details
          </Button>
        </Link>
        <Button className="w-full mt-4" onClick={() => setShowCarDetails(false)}>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}

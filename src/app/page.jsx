"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import SignUpModal from "@/components/ui/SignUpModal";
import LoginModal from "@/components/ui/LoginModal";
import AccountModal from "@/components/ui/AccountModal";
import { Button } from "@/components/ui/button"

export default function Component() {
  const [cars, setCars] = useState([]);
  const [error, setError] = useState(null);
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token) {
        setAuthToken(token);
        console.log(`Auth token set to: ${token}`);
      }
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    fetch("http://192.168.68.102:8000/listings/cars/")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setCars(data))
      .catch((error) => {
        console.error("Failed to fetch cars:", error);
        setError("Failed to load cars. Please try again later.");
      });
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="#" className="flex items-center gap-2 font-bold" prefetch={false}>
            <CarIcon className="h-6 w-6" />
            <span className="hidden sm:inline">Car Shop</span>
          </Link>
          <nav className="hidden items-center gap-4 sm:flex">
            <Link href="#" className="text-sm font-medium hover:text-primary" prefetch={false}>
              Browse Cars
            </Link>
            <Link href="#" className="text-sm font-medium hover:text-primary" prefetch={false}>
              Certifications
            </Link>
            <Link href="#" className="text-sm font-medium hover:text-primary" prefetch={false}>
              About
            </Link>
            <Link href="#" className="text-sm font-medium hover:text-primary" prefetch={false}>
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {authToken ? (
              <Button onClick={() => setShowAccountModal(true)} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Account
              </Button>
            ) : (
              <>
                <Button onClick={() => setShowLoginModal(true)} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  Login
                </Button>
                <Button onClick={() => setShowSignUpModal(true)} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="bg-gradient-to-r from-primary to-primary-foreground py-20">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold text-primary-foreground sm:text-5xl">
                Welcome to Car Shop
              </h1>
              <p className="mt-4 text-lg text-primary-foreground/90">
                Browse our selection of certified pre-owned vehicles and find your dream car.
              </p>
              <div className="mt-8">
                <Link
                  href="#"
                  className="rounded-md bg-primary-foreground px-6 py-3 text-sm font-medium text-primary hover:bg-primary-foreground/90"
                  prefetch={false}
                >
                  Explore Cars
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                cars.map((car) => (
                  <Card key={car.id}>
                    <img
                      src="placeholder.svg"
                      alt={`${car.make} ${car.model}`}
                      width={400}
                      height={300}
                      className="rounded-t-lg object-cover"
                      style={{ aspectRatio: "400/300", objectFit: "cover" }}
                    />
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold">
                        {car.make} {car.model}
                      </h3>
                      <p className="mt-2 text-muted-foreground">
                        {car.year} • {car.mileage ? `${car.mileage} miles` : "Mileage not available"}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-2xl font-bold">${car.price}</span>
                        <Link
                          href="#"
                          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                          prefetch={false}
                        >
                          View Details
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-muted py-8">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <div>
              <h4 className="text-lg font-bold">Car Shop</h4>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary" prefetch={false}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary" prefetch={false}>
                    Browse Cars
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary" prefetch={false}>
                    Certifications
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary" prefetch={false}>
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary" prefetch={false}>
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold">Support</h4>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary" prefetch={false}>
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary" prefetch={false}>
                    Returns & Refunds
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary" prefetch={false}>
                    Warranty
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary" prefetch={false}>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary" prefetch={false}>
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold">Contact</h4>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    +1 (234) 567-890
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    info@carshop.com
                  </a>
                </li>
                <li>
                  <p className="text-muted-foreground">123 Main St, Anytown USA</p>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold">Follow Us</h4>
              <div className="mt-4 flex items-center gap-4">
                <Link href="#" className="text-muted-foreground hover:text-primary" prefetch={false}>
                  <FacebookIcon className="h-6 w-6" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary" prefetch={false}>
                  <TwitterIcon className="h-6 w-6" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary" prefetch={false}>
                  <InstagramIcon className="h-6 w-6" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary" prefetch={false}>
                  <LinkedinIcon className="h-6 w-6" />
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
            &copy; 2023 Car Shop. All rights reserved.
          </div>
        </div>
      </footer>
      {showAccountModal && (
        <AccountModal
          showAccountModal={showAccountModal}
          setShowAccountModal={setShowAccountModal}
        />
      )}
      {showSignUpModal && (
        <SignUpModal
          showSignUpModal={showSignUpModal}
          setShowSignUpModal={setShowSignUpModal}
        />
      )}
      {showLoginModal && (
        <LoginModal
          showLoginModal={showLoginModal}
          setShowLoginModal={setShowLoginModal}
        />
      )}
    </div>
  );
}

function ArrowRightIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function CarIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

function FacebookIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function ShieldIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

function TruckIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  );
}

function TwitterIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function WrenchIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

"use client";

import { useState, useEffect } from "react";
import Header from "@/components/ui/header";
import CarList from "@/components/ui/carList";
import Footer from "@/components/ui/footer";
import SignUpModal from "@/components/ui/SignUpModal";
import LoginModal from "@/components/ui/LoginModal";
import AccountModal from "@/components/ui/AccountModal";

const Component = () => {
  const [cars, setCars] = useState([]);
  const [error, setError] = useState(null);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setAuthToken(token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setAuthToken(null);
    setShowAccountModal(false);
  };

  useEffect(() => {
    fetch("http://localhost:8000/listings/cars/")
      .then((response) => response.json())
      .then(setCars)
      .catch(() => setError("Failed to load cars. Please try again later."));
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        authToken={authToken}
        setShowSignUpModal={setShowSignUpModal}
        setShowLoginModal={setShowLoginModal}
        setShowAccountModal={setShowAccountModal}
        handleLogout={handleLogout}
      />
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
        <CarList cars={cars} error={error} />
      </main>
      <Footer />
      {/* Modals */}
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
          setAuthToken={setAuthToken}
        />
      )}
    </div>
  );

}
export default Component;
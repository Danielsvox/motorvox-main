import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Header({ 
  authToken = null, 
  setShowSignUpModal = () => {}, 
  setShowLoginModal = () => {}, 
  setShowAccountModal = () => {}, 
  handleLogout = () => {} 
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold" prefetch={false}>
          <CarIcon className="h-6 w-6" />
          <span className="hidden sm:inline">MotorVox</span>
        </Link>
        <nav className="hidden items-center gap-4 sm:flex">
          <Link href="/" className="text-sm font-medium hover:text-primary" prefetch={false}>Browse Cars</Link>
          <Link href="#" className="text-sm font-medium hover:text-primary" prefetch={false}>Certifications</Link>
          <Link href="#" className="text-sm font-medium hover:text-primary" prefetch={false}>About</Link>
          <Link href="#" className="text-sm font-medium hover:text-primary" prefetch={false}>Contact</Link>
        </nav>
        <div className="flex items-center gap-4">
          {authToken ? (
            <>
              <Button onClick={() => setShowAccountModal(true)} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Account
              </Button>
              <Button onClick={handleLogout} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Logout
              </Button>
            </>
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
  );
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
}

"use client";

// This is the root layout component for your Next.js app.
// Learn more: https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#root-layout-required
import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils'
import './globals.css'
import { useState, useEffect } from "react";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import SignUpModal from "@/components/ui/SignUpModal";
import LoginModal from "@/components/ui/LoginModal";
import AccountModal from "@/components/ui/AccountModal";
import { ChatProvider } from '@/contexts/ChatContext';
import ChatManager from '@/components/chat/ChatManager';
import { UserProvider } from "@/contexts/UserContext";

const fontHeading = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
})

const fontBody = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
})

export default function RootLayout({ children }) {
  // Auth and modal state
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  // Load auth token on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token !== authToken) {
      setAuthToken(token);
    }
  }, [authToken]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setAuthToken(null);
    setShowAccountModal(false);
    setShowLoginModal(false);
    setShowSignUpModal(false);
  };

  const handleLogin = (token) => {
    localStorage.setItem("authToken", token);
    setAuthToken(token);
    setShowLoginModal(false);
  };

  return (
    <html lang="en">
      <body
        className={cn(
          'antialiased',
          fontHeading.variable,
          fontBody.variable
        )}
      >
        <UserProvider>
          <ChatProvider>
            <div className="flex flex-col min-h-screen bg-background">
              <Header
                authToken={authToken}
                setShowSignUpModal={setShowSignUpModal}
                setShowLoginModal={setShowLoginModal}
                setShowAccountModal={setShowAccountModal}
                handleLogout={handleLogout}
              />
              {children}
              <Footer />
              {/* Modals */}
              {showAccountModal && (
                <AccountModal
                  showAccountModal={showAccountModal}
                  setShowAccountModal={setShowAccountModal}
                  handleLogout={handleLogout}
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
                  setAuthToken={handleLogin}
                />
              )}
              <ChatManager />
            </div>
          </ChatProvider>
        </UserProvider>
      </body>
    </html>
  )
}
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginModal({ showLoginModal, setShowLoginModal, setAuthToken  }) {
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });
  const [loginError, setLoginError] = useState(null);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/api/token/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login successful:", data);

        // Store the token in localStorage (or in a state management store if you prefer)
        localStorage.setItem("authToken", data.access);
        setAuthToken(data.access);
        // Handle successful login (e.g., redirect, show a success message, etc.)
        setShowLoginModal(false);
      } else {
        const errorData = await response.json();
        console.error("Login failed:", errorData);
        setLoginError("Invalid username or password");
      }
    } catch (error) {
      console.error("An error occurred during login:", error);
      setLoginError("An error occurred. Please try again later.");
    }
  };

  const handleLoginInputChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
          <DialogDescription>Enter your username and password to log in.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleLoginSubmit} className="grid gap-4 py-4">
          {loginError && <p className="text-red-500">{loginError}</p>}
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="username" className="text-left">
              Username
            </Label>
            <Input
              id="username"
              name="username"
              value={loginData.username}
              onChange={handleLoginInputChange}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="password" className="text-left">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={loginData.password}
              onChange={handleLoginInputChange}
              className="w-full"
            />
          </div>
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

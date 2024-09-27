import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignUpModal({ showSignUpModal, setShowSignUpModal }) {
  const [signUpData, setSignUpData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    location: "",
    phone_number: "",
  });

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://192.168.68.102:8000/api/users/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signUpData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Sign-up successful:", data);
        setShowSignUpModal(false);
      } else {
        const errorData = await response.json();
        console.error("Sign-up failed:", errorData);
      }
    } catch (error) {
      console.error("An error occurred during sign-up:", error);
    }
  };

  const handleSignUpInputChange = (e) => {
    setSignUpData({
      ...signUpData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Dialog open={showSignUpModal} onOpenChange={setShowSignUpModal}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sign Up</DialogTitle>
          <DialogDescription>Enter your information to create an account.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSignUpSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="first_name" className="text-left">
              First Name
            </Label>
            <Input
              id="first_name"
              name="first_name"
              value={signUpData.first_name}
              onChange={handleSignUpInputChange}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="last_name" className="text-left">
              Last Name
            </Label>
            <Input
              id="last_name"
              name="last_name"
              value={signUpData.last_name}
              onChange={handleSignUpInputChange}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="username" className="text-left">
              Username
            </Label>
            <Input
              id="username"
              name="username"
              value={signUpData.username}
              onChange={handleSignUpInputChange}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="email" className="text-left">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={signUpData.email}
              onChange={handleSignUpInputChange}
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
              value={signUpData.password}
              onChange={handleSignUpInputChange}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="location" className="text-left">
              Location
            </Label>
            <Input
              id="location"
              name="location"
              value={signUpData.location}
              onChange={handleSignUpInputChange}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="phone_number" className="text-left">
              Phone Number
            </Label>
            <Input
              id="phone_number"
              name="phone_number"
              value={signUpData.phone_number}
              onChange={handleSignUpInputChange}
              className="w-full"
            />
          </div>
          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

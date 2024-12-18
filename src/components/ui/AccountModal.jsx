import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AccountModal({ showAccountModal, setShowAccountModal }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      setAuthToken(null);
      setShowAccountModal(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      fetch("http://localhost:8000/api/users/me/", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setUserData(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [showAccountModal]);

  return (
    <Dialog open={showAccountModal} onOpenChange={setShowAccountModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Account Information</DialogTitle>
        </DialogHeader>
        {loading ? (
          <p>Loading...</p>
        ) : userData ? (
          <div className="grid gap-4 py-4">
            <p><strong>Username:</strong> {userData.username}</p>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>First Name:</strong> {userData.first_name}</p>
            <p><strong>Last Name:</strong> {userData.last_name}</p>
            {/* Add more fields as necessary */}
            <Button onClick={handleLogout} className="mt-4">
            Logout
          </Button>
          </div>
        ) : (
          <p>No user data found.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-muted py-8">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {/* Footer content here */}
        </div>
        <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
          &copy; 2024 MotorVox. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import SmoothScrollProvider from "./components/SmoothScrollProvider";
import CommandPalette from "./components/CommandPalette";
import { DateFilterProvider } from "./context/DateFilterContext";

export const metadata: Metadata = {
  title: "Athlixir | Kinetic Biomechanics Suite",
  description: "Computer vision sprint telemetry and athletic performance suite.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#FF4F21",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="antialiased">
      <body className="bg-[#F2F2F7] font-poppins text-[#1C1C1E] antialiased">
        <SmoothScrollProvider>
          <AuthProvider>
            <DateFilterProvider>
              <ProtectedRoute>{children}</ProtectedRoute>
              <CommandPalette />
            </DateFilterProvider>
          </AuthProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}

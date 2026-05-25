import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import SmoothScrollProvider from "./components/SmoothScrollProvider";
import CommandPalette from "./components/CommandPalette";
import { DateFilterProvider } from "./context/DateFilterContext";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Athlixir | Enterprise Client Suite",
  description: "Secure, real-time workspace gateway for modern athletes and managers.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${poppins.variable} ${geistMono.variable} antialiased dark`}>
      <body className="bg-black font-sans text-zinc-100 antialiased">
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

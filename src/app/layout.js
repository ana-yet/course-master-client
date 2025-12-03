import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/shared/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "CourseMaster",
  description: "Learn without limits.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>

          {/* react hot toast */}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#333",
                color: "#fff",
              },
              success: {
                style: {
                  background: "#10b981", // Emerald-500
                },
              },
              error: {
                style: {
                  background: "#e11d48", // Rose-600
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}

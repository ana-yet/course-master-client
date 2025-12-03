import { Inter } from "next/font/google";
import "./globals.css";

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
      {/* Apply the variable to the body */}
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}

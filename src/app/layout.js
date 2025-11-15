import { Roboto } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../components/providers/AuthProvider";
import { ThemeProvider } from "../hooks/useTheme";

const roboto = Roboto({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata = {
  title: "Doctors Orders - AI-Powered SOAP Notes",
  description: "AI-powered documentation for physical therapists. Generate professional SOAP notes in seconds.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${roboto.variable} font-sans antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

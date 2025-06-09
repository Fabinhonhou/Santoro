import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

export const metadata: Metadata = {
  title: "Santoros's Italian Kitchen - Culinária Italiana Autêntica",
  description:
    "Experimente a melhor culinária italiana no Santoros's Italian Kitchen. Reserve sua mesa hoje para uma experiência gastronômica inesquecível.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}

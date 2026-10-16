import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Household Wealth", description: "Track House, FD, RD and Gold investments." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }

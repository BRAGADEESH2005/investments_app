import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Household Wealth", description: "Manage investments, LIC insurance, financial goals and net worth." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }

import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({ 
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "TTT | شبكة التواصل الاجتماعي",
  description: "منصة تواصل جديدة من Beta تقدم تجربة حرة، آمنة ومميزة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.className} bg-slate-50 text-slate-900 antialiased selection:bg-amber-500 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
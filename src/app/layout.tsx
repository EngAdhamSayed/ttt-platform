import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "TTT Platform | منصة التواصل الحرة",
  description: "منصة تواصل اجتماعي حديثة وحرة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-slate-100 text-slate-800 antialiased min-h-screen">
        <div className="max-w-md mx-auto min-h-screen relative bg-slate-50 border-x border-slate-200/80 shadow-sm">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
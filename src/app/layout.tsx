import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "TTT Platform | منصة التواصل الحرة",
  description: "منصة تواصل اجتماعي حرة ومتقدمة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen selection:bg-amber-500 selection:text-slate-950">
        <div className="max-w-md mx-auto min-h-screen relative border-x border-slate-900 shadow-2xl bg-slate-950">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
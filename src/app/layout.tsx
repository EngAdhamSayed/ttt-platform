import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "TTT Platform | منصة التواصل الحرة",
  description: "منصة تواصل اجتماعي حديثة وحرة تشبه Facebook بصريًا وتعمل بسلاسة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_65%,_#e2e8f0)] text-slate-800 antialiased">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col bg-slate-50/95 shadow-[0_0_45px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
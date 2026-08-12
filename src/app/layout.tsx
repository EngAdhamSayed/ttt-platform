import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import AuthGuard from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: "TTT Platform | منصة التواصل الحرة",
  description: "منصة تواصل اجتماعي حديثة وحرة تشبه Facebook بصريًا وتعمل بسلاسة",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed,_#fffbeb_65%,_#fed7aa)] text-slate-800 antialiased">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col bg-slate-50/95 shadow-[0_0_45px_rgba(249,115,22,0.12)] ring-1 ring-orange-200/80">
          <AuthGuard>
            {children}
            <BottomNav />
          </AuthGuard>
        </div>
      </body>
    </html>
  );
}
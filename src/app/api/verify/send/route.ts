import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, fullName, code, expiresAt } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ ok: false, message: "بيانات غير مكتملة." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM || "onboarding@resend.dev";

    if (!apiKey) {
      return NextResponse.json(
        {
          ok: true,
          fallback: true,
          message: `تم توليد الرمز بنجاح. استخدم هذا الرمز لإكمال التحقق: ${code}`,
          code,
          expiresAt,
        },
        { status: 200 },
      );
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "رمز التحقق من TTT Platform",
        html: `
          <div style="font-family: Arial, sans-serif; direction: rtl; padding: 24px; background: #fff7ed; border-radius: 16px;">
            <h2 style="color: #ea580c;">رمز التحقق الخاص بك</h2>
            <p>مرحبًا ${fullName || "عزيزي المستخدم"}،</p>
            <p>رمز التحقق الخاص بك هو:</p>
            <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; background: #fff; padding: 16px; border-radius: 12px; display: inline-block; margin: 12px 0;">${code}</div>
            <p>يظل هذا الرمز صالحًا لمدة 3 دقائق فقط.</p>
            <p>شكرًا لاستخدام TTT Platform.</p>
          </div>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ ok: false, message: data.message || "فشل إرسال البريد" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "تم إرسال الرمز إلى البريد الإلكتروني." });
  } catch (error) {
    console.error("Verification email failed", error);
    return NextResponse.json({ ok: false, message: "حدث خطأ أثناء إرسال الرمز." }, { status: 500 });
  }
}

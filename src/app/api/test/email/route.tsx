import { EmailTemplate } from '@/components/email-template';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import * as React from 'react'; // <--- INI KUNCINYA (Supaya JSX terbaca)

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, score, details } = await request.json();

    // Pastikan API Key ada (Debugging Vercel)
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ API Key Resend TIDAK DITEMUKAN");
      return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });
    }

    const { data, error } = await resend.emails.send({
      from: 'TOEFL System <onboarding@resend.dev>',
      to: [email],
      subject: `Hasil Ujian TOEFL - ${name}`,
      react: (
        <EmailTemplate 
          name={name}
          score={score}
          listening={details.listening}
          structure={details.structure}
          reading={details.reading}
        />
      ),
    });

    if (error) {
      console.error("❌ Resend Error:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Server Error:", error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
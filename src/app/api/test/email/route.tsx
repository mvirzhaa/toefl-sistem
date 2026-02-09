import { EmailTemplate } from '@/components/email-template';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Pastikan API Key dibaca
const apiKey = process.env.RESEND_API_KEY;
const resend = new Resend(apiKey);

export async function POST(request: Request) {
  try {
    const { name, email, score, details } = await request.json();

    console.log("1. Cek API Key:", apiKey ? "Ada (Aman)" : "KOSONG (Bahaya!)");
    console.log("2. Mencoba kirim ke:", email);

    // Cek Ketersediaan API Key sebelum kirim
    if (!apiKey) {
      console.error("❌ API Key tidak ditemukan. Cek file .env anda!");
      return NextResponse.json({ error: 'API Key Missing' }, { status: 500 });
    }

    const { data, error } = await resend.emails.send({
      from: 'TOEFL System <onboarding@resend.dev>',
      to: [email],
      subject: `Hasil Ujian TOEFL - ${name}`,
      react: EmailTemplate({ 
        name, score, listening: details.listening, structure: details.structure, reading: details.reading
      }),
    });

    if (error) {
      console.error("❌ RESEND MENOLAK:", error); 
      // Error ini biasanya karena email penerima BEDA dengan email pendaftar Resend
      return NextResponse.json({ error }, { status: 500 });
    }

    console.log("✅ Email BERHASIL dikirim:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ CRITICAL ERROR:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
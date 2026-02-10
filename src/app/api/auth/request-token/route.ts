import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/client';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    // 1. Generate Token 6 Digit
    const token = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Set Kadaluarsa (misal 15 menit)
    const expiresAt = new Date(new Date().getTime() + 15 * 60 * 1000);

    // 3. Simpan ke Database
    await prisma.verificationToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    // 4. Kirim Email via Resend
    await resend.emails.send({
      from: 'TOEFL System <onboarding@resend.dev>',
      to: [email],
      subject: 'Kode Akses Ujian TOEFL Anda',
      html: `
        <h1>Halo, ${name}!</h1>
        <p>Gunakan kode token di bawah ini untuk memulai ujian:</p>
        <h2 style="background:#eee; padding:10px; width:fit-content; border-radius:5px;">${token}</h2>
        <p>Kode ini berlaku selama 15 menit.</p>
        <p><i>Semoga sukses!</i></p>
      `,
    });

    return NextResponse.json({ message: 'Token sent' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal mengirim token' }, { status: 500 });
  }
}
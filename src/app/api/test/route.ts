import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic'; // Wajib agar soal selalu diacak ulang

export async function GET() {
  try {
    // Ambil soal dengan field LENGKAP
    const questions = await prisma.question.findMany({
      select: {
        id: true,
        category: true,
        questionText: true,
        questionType: true,   // Field Baru
        imageUrl: true,       // Field Baru
        audioUrl: true,
        options: true,        // WAJIB ADA: Pilihan Ganda
        correctAnswer: true,  // Dibutuhkan untuk hitung skor di frontend
      },
    });

    // Acak urutan soal (Shuffle)
    const shuffled = questions.sort(() => Math.random() - 0.5);

    return NextResponse.json(shuffled);
  } catch (error) {
    console.error("Gagal mengambil soal ujian:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
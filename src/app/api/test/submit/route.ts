import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/client';

export async function POST(request: Request) {
  const prisma = new PrismaClient();

  try {
    const body = await request.json();
    // body sekarang berisi: { answers, userData: { name, email, phone } }

    const allQuestions = await prisma.question.findMany();
    
    // Hitung Nilai di Server
    let serverScore = 0;
    allQuestions.forEach(q => {
      const userAnswer = body.answers[q.id];
      if (userAnswer && userAnswer === q.correctAnswer) {
        serverScore += 1;
      }
    });

    // Simpan Data Terpisah (Sesuai Schema Baru)
    const session = await prisma.testSession.create({
      data: {
        name: body.userData.name,   // Ambil nama
        email: body.userData.email, // Ambil email
        phone: body.userData.phone, // Ambil HP
        score: serverScore,
        totalQ: allQuestions.length,
        answers: body.answers,
      },
    });

    return NextResponse.json({ success: true, score: serverScore });

  } catch (error) {
    console.error("Gagal submit:", error);
    return NextResponse.json({ error: "Gagal menyimpan nilai" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
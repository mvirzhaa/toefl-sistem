// src/app/api/questions/route.ts
import { NextResponse } from 'next/server';
// PERHATIKAN: Import dari lokasi baru yang kita set di schema tadi
import { PrismaClient } from '@/generated/client'; 

export async function POST(request: Request) {
  // Inisialisasi client baru
  const prisma = new PrismaClient();

  try {
    const body = await request.json();
    console.log("Mencoba menyimpan:", body);

    const question = await prisma.question.create({
      data: {
        type: body.type,
        category: body.category,
        questionText: body.questionText,
        audioUrl: body.audioUrl || null,
        options: body.options || [], 
        correctAnswer: body.correctAnswer,
      },
    });

    return NextResponse.json(question, { status: 201 });

  } catch (error: any) {
    console.error("❌ ERROR SERVER:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan", details: error.message }, 
      { status: 500 }
    );
  } finally {
    // Tutup koneksi
    await prisma.$disconnect();
  }
}
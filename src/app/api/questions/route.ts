import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil soal' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newQuestion = await prisma.question.create({
      data: {
        category: body.category,
        questionText: body.questionText,
        
        // FITUR BARU
        questionType: body.questionType || 'CHOICE', // Default Pilihan Ganda
        imageUrl: body.imageUrl || null,
        
        audioUrl: body.audioUrl || '',
        options: body.options || [], 
        correctAnswer: body.correctAnswer || '',
      },
    });
    return NextResponse.json(newQuestion);
  } catch (error) {
    console.error("Error creating question:", error); // Cek terminal kalau error
    return NextResponse.json({ error: 'Gagal menyimpan soal' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID Kosong' }, { status: 400 });

    await prisma.question.delete({ where: { id: id } });
    return NextResponse.json({ message: 'Soal dihapus' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal hapus' }, { status: 500 });
  }
}
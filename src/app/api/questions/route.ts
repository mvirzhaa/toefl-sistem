import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/client';

const prisma = new PrismaClient();

// 1. GET: Ambil Semua Soal
export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      orderBy: { createdAt: 'desc' } // Soal terbaru di atas
    });
    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil soal' }, { status: 500 });
  }
}

// 2. POST: Tambah Soal
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newQuestion = await prisma.question.create({
      data: {
        type: body.type,
        category: body.category,
        questionText: body.questionText,
        audioUrl: body.audioUrl || '',
        options: body.options, // Array String
        correctAnswer: body.correctAnswer,
      },
    });
    return NextResponse.json(newQuestion);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan soal' }, { status: 500 });
  }
}

// 3. DELETE: Hapus Soal berdasarkan ID
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID tidak ditemukan' }, { status: 400 });
    }

    await prisma.question.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: 'Soal berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus soal' }, { status: 500 });
  }
}
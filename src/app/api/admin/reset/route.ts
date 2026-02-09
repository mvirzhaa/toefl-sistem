import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/client';

const prisma = new PrismaClient();

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'results' atau 'questions'

    if (type === 'results') {
      // Hapus SEMUA data nilai
      await prisma.testSession.deleteMany({});
      return NextResponse.json({ message: "Semua data nilai berhasil dihapus." });
    } 
    
    if (type === 'questions') {
        // Hapus SEMUA soal (Hati-hati)
        await prisma.question.deleteMany({});
        return NextResponse.json({ message: "Semua soal berhasil dihapus." });
    }

    return NextResponse.json({ error: "Tipe tidak valid" }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ error: "Gagal mereset data" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
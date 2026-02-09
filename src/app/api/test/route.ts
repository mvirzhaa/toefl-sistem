import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/client'; // Import dari yang sudah kita fix tadi

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Ambil semua soal
    const questions = await prisma.question.findMany();
    
    // Acak sedikit di server biar aman, tapi pengurutan kategori diatur di Frontend
    return NextResponse.json(questions, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil soal" }, { status: 500 });
  }
}
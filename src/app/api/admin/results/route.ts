// src/app/api/admin/results/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/client';

const prisma = new PrismaClient();

// 1. GET: Ambil Semua Data Hasil Ujian
export async function GET() {
  try {
    const results = await prisma.testSession.findMany({
      orderBy: { createdAt: 'desc' }, // Yang terbaru paling atas
    });
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  }
}

// 2. DELETE: Hapus Data Tertentu
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "ID kosong" }, { status: 400 });

    await prisma.testSession.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal hapus" }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/client';

const prisma = new PrismaClient();

// GET: Ambil Durasi (Default 120 menit jika belum disetting)
export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'exam_duration' },
    });

    // Jika belum ada di database, kembalikan default 120 menit
    const duration = setting ? parseInt(setting.value) : 120;
    
    return NextResponse.json({ duration });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil pengaturan' }, { status: 500 });
  }
}

// POST: Simpan Durasi Baru
export async function POST(request: Request) {
  try {
    const { duration } = await request.json();

    await prisma.setting.upsert({
      where: { key: 'exam_duration' },
      update: { value: String(duration) },
      create: { key: 'exam_duration', value: String(duration) },
    });

    return NextResponse.json({ message: 'Pengaturan berhasil disimpan' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan pengaturan' }, { status: 500 });
  }
}
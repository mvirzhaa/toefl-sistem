import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, token } = await request.json();

    // 1. Cari Token di Database
    const validToken = await prisma.verificationToken.findFirst({
      where: {
        email: email,
        token: token,
        expiresAt: { gt: new Date() } // Harus belum kadaluarsa
      },
      orderBy: { createdAt: 'desc' } // Ambil yang paling baru
    });

    if (!validToken) {
      return NextResponse.json({ error: 'Token salah atau sudah kadaluarsa!' }, { status: 400 });
    }

    // 2. Jika valid, kita bisa hapus tokennya (sekali pakai) atau biarkan saja.
    // Untuk keamanan, sebaiknya dihapus setelah dipakai:
    await prisma.verificationToken.delete({ where: { id: validToken.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
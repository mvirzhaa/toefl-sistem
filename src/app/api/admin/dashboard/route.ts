import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Pastikan path prisma benar

export async function GET() {
  try {
    // Ambil data skor dan tanggal saja
    const results = await prisma.testSession.findMany({
      select: {
        score: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}
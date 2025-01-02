import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: Request) {
  const images = await db.images.findMany();

  return NextResponse.json(images, { status: 200 });
}

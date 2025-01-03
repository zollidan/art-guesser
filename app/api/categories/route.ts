import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: Request) {
  const categories = await db.categories.findMany({
    where: {
      images: {
        some: {}, // Подзапрос проверяет наличие хотя бы одного изображения
      },
    },
  });

  return NextResponse.json(categories, { status: 200 });
}

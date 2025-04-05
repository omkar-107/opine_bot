import connectToDatabase from "@/utils/db";
import Faculty from "@/models/Faculty";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const count = await Faculty.countDocuments();
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error counting faculties:", error);
    return NextResponse.json(
      { message: "Error counting faculties" },
      { status: 500 }
    );
  }
}

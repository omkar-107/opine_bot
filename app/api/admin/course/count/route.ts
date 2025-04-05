import connectToDatabase from "@/utils/db";
import Course from "@/models/Course";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const count = await Course.countDocuments();
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error counting courses:", error);
    return NextResponse.json(
      { message: "Error counting courses" },
      { status: 500 }
    );
  }
}

import connectToDatabase from "@/utils/db";
import Student from "@/models/Student";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const count = await Student.countDocuments();
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error counting students:", error);
    return NextResponse.json(
      { message: "Error counting students" },
      { status: 500 }
    );
  }
}

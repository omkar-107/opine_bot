import connectToDatabase from "@/utils/db";
import Student from "@/models/Student";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  const { dept, year, sem } = await req.json();

  if (!dept || !year || !sem) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  try {
    const students = await Student.find(
      {
        branch: dept,
        year: year,
        semester: sem,
      },
      { password: 0 }
    );
    return NextResponse.json({ students });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { message: "Error fetching students" },
      { status: 500 }
    );
  }
}

import connectToDatabase from "@/utils/db";
import Student from "@/models/Student";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, res: NextResponse) {
  await connectToDatabase();
  try {
    const students = await Student.find(
      {},
      {
        username: 1,
        branch: 1,
        year: 1,
        student_courses: 1,
      }
    );
    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { message: "Error fetching students" },
      { status: 500 }
    );
  }
}

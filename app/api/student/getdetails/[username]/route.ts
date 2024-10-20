import connectToDatabase from "@/utils/db";
import Student from "@/models/Student";
import { NextRequest, NextResponse } from "next/server";

//e.g==> http://localhost:3000/api/student/getdetails/21510046

export async function GET(req: NextRequest) {
  await connectToDatabase();

  // Access dynamic parameters using `req.nextUrl`
  const username = req.nextUrl.pathname.split("/").pop(); // Get the username from the URL

  try {
    const student = await Student.findOne({ username });
    if (!student) {
      return NextResponse.json({ message: "Student details not found" });
    }
    return NextResponse.json({
      email: student.email,
      username: student.username,
      branch: student.branch,
      semester: student.semester,
      year: student.year,
    });
  } catch (error) {
    console.error("Error fetching student details:", error);
    return NextResponse.json(
      { message: "Error fetching student details" },
      { status: 500 }
    );
  }
}

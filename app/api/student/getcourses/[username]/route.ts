import connectToDatabase from "@/utils/db";
import Student from "@/models/Student";
import { NextRequest, NextResponse } from "next/server";
import {authorizeUsername} from "@/utils/auth";
export const dynamic = 'force-dynamic';

//e.g==> http://localhost:3000/api/student/getcourses/21210070

export async function GET(req: NextRequest) {
  await connectToDatabase();

  // Access dynamic parameters using `req.nextUrl`
  const username = req.nextUrl.pathname.split("/").pop(); // Get the username from the URL

  if (!username) {
    return NextResponse.json({ message: "Please provide username" });
  }

  const isAuthorized = await authorizeUsername(
    req.cookies.get("auth")?.value,
    username
  );
  if (!isAuthorized) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const student = await Student.findOne({ username });
    if (!student) {
      return NextResponse.json({ message: "Student not found" });
    }
    return NextResponse.json({ student_courses: student.student_courses });
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { message: "Error fetching student" },
      { status: 500 }
    );
  }
}

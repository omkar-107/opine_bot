import connectToDatabase from "@/utils/db";
import Student from "@/models/Student";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  const { username, password, branch, year } = await req.json();
  if (!username || !password || !branch || !year) {
    return NextResponse.json(
      { message: "Please fill in all fields" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  try {
    // Check if the student already exists
    const studentExists = await Student.findOne({ username });
    if (studentExists) {
      return NextResponse.json(
        { message: "Student already exists" },
        { status: 400 }
      );
    }

    const newStudent = new Student({
      username,
      password,
      branch,
      year,
      student_courses: [],
    });

    await newStudent.save();

    return NextResponse.json({ message: "Student added successfully" });
  } catch (error) {
    console.error("Error adding student:", error);
    return NextResponse.json(
      { message: "Error adding student" },
      { status: 500 }
    );
  }
}

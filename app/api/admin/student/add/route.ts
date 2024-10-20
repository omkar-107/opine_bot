import connectToDatabase from "@/utils/db";
import Student from "@/models/Student";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  const { email, username, password, branch, year, student_courses, semester } =
    await req.json();
  if (
    !email ||
    !username ||
    !password ||
    !branch ||
    !year ||
    !student_courses ||
    !semester
  ) {
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

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newStudent = new Student({
      email,
      username,
      password: hashedPassword,
      branch,
      year,
      student_courses,
      semester,
    });

    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      role: "student",
    });

    console.log(newUser, newStudent);

    await newUser.save();
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

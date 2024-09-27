import connectToDatabase from "@/utils/db";
import Faculty from "@/models/Faculty";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  const { username, password, department } = await req.json();

  if (!username || !password || !department) {
    return NextResponse.json(
      { message: "Please fill in all fields" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  try {
    // Check if the faculty already exists
    const facultyExists = await Faculty.findOne({ username });
    if (facultyExists) {
      return NextResponse.json(
        { message: "Faculty already exists" },
        { status: 400 }
      );
    }

    const newFaculty = new Faculty({
      username,
      password,
      department,
      faculty_courses: [],
    });

    await newFaculty.save();

    return NextResponse.json(
      { message: "Faculty added successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding faculty:", error);
    return NextResponse.json(
      { message: "Error adding faculty" },
      { status: 500 }
    );
  }
}

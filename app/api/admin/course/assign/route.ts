import connectToDatabase from "@/utils/db";
import Course from "@/models/Course";
import Faculty from "@/models/Faculty";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { courseid_, facultyId } = await req.json();
  if (!courseid_ || !facultyId) {
    return NextResponse.json(
      { message: "Please fill in all fields" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  try {
    // Check if the course exists
    const course = await Course.findOne({ id_: courseid_ });
    if (!course) {
      return NextResponse.json(
        { message: "Course does not exist" },
        { status: 400 }
      );
    }

    // Check if the faculty exists
    const facultyExists = await Faculty.findOne({ username: facultyId });
    if (!facultyExists) {
      return NextResponse.json(
        { message: "Faculty does not exist" },
        { status: 400 }
      );
    }

    // Assign the course to the faculty
    course.faculty.push(facultyId);
    await course.save();

    facultyExists.faculty_courses.push(courseid_);
    await facultyExists.save();

    return NextResponse.json({ message: "Course assigned successfully" });
  } catch (error) {
    console.error("Error assigning course:", error);
    return NextResponse.json(
      { message: "Error assigning course" },
      { status: 500 }
    );
  }
}

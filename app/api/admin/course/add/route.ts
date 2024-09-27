import connectToDatabase from "@/utils/db";
import Course from "@/models/Course";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  const { id_, title, syllabus } = await req.json();

  if (!id_ || !title || !syllabus) {
    return NextResponse.json(
      { message: "Please fill in all fields" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  try {
    // Check if the course exists
    const course = await Course.findOne({ id_ });
    if (course) {
      return NextResponse.json(
        { message: "Course already exists" },
        { status: 400 }
      );
    }

    const newCourse = new Course({
      id_,
      title,
      syllabus,
      faculty: [],
      feedbacks: [],
    });
    await newCourse.save();

    return NextResponse.json({ message: "Course added successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

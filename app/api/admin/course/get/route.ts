import connectToDatabase from "@/utils/db";
import Course from "@/models/Course";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, res: NextResponse) {
  await connectToDatabase();

  try {
    const courses = await Course.find({}, { id_: 1, title: 1, syllabus: 1 });
    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { message: "Error fetching courses" },
      { status: 500 }
    );
  }
}

import connectToDatabase from "@/utils/db";
import Course from "@/models/Course";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {

  const id_ = req.nextUrl.searchParams.get('id_');

  if (!id_) {
    return NextResponse.json(
      { message: "Course Id is required" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  try {
    // Check if the course exists
    const course = await Course.findOne({ id_: id_ });
    if (!course) {
      return NextResponse.json(
        { message: "Course does not exist" },
        { status: 400 }
      );
    }

    // Delete the course
    await Course.deleteOne({ id_: id_ });
    console.log("Course deleted successfully with id", id_);

    return NextResponse.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

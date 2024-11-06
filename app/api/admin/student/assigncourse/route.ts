import connectToDatabase from "@/utils/db"; // Your database connection function
import Student from "@/models/Student"; // Your Student model
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { branch, year, semester, course_id } = await req.json();

  if (!branch || !year || !semester || !course_id) {
    return NextResponse.json(
      {
        message:
          "Please provide all required fields: branch, year, semester, and course_id",
      },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    // Update students that match the branch, year, and semester criteria
    const result = await Student.updateMany(
      { branch, year, semester },
      { $addToSet: { student_courses: course_id } } // Add course_id only if it doesn't already exist
    );

    return NextResponse.json(
      {
        message: "Courses assigned successfully to students",
        matchedCount: result.matchedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error assigning courses to the students:", error);
    return NextResponse.json(
      { message: "Error assigning courses to the students", error },
      { status: 500 }
    );
  }
}

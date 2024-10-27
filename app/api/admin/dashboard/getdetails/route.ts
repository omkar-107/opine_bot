import connectToDatabase from "@/utils/db";
import Faculty from "@/models/Faculty";
import Student from "@/models/Student";
import Course from "@/models/Course";
import FeedbackTask from "@/models/FeedbackTask";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const [
      facultyCount,
      studentCount,
      courseCount,
      activeFeedbackTasks
    ] = await Promise.all([
      Faculty.countDocuments({}),
      Student.countDocuments({}),
      Course.countDocuments({}),
      FeedbackTask.countDocuments({ status: "active" })
    ]);

    return NextResponse.json({
      facultyCount,
      studentCount,
      courseCount,
      activeFeedbackTasks
    });

  } catch (error) {
    console.error("Error fetching dashboard details:", error);
    return NextResponse.json(
      { message: "Error fetching dashboard details" },
      { status: 500 }
    );
  }
}
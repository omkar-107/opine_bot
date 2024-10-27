import connectToDatabase from "@/utils/db";
import { NextResponse } from "next/server";
import Faculty from "@/models/Faculty";
import Student from "@/models/Student";
import Course from "@/models/Course";
import FeedbackTask from "@/models/FeedbackTask";

export async function GET(req: NextResponse) {
  await connectToDatabase();
  try {
    const facultyCount = await Faculty.countDocuments();
    const studentCount = await Student.countDocuments();
    const courseCount = await Course.countDocuments();
    const activeFeedbackTasks = await FeedbackTask.countDocuments({
      active: true,
    });
    return NextResponse.json({
      facultyCount,
      studentCount,
      courseCount,
      activeFeedbackTasks,
    });
  } catch (error) {
    console.error("Error fetching dashboard details:", error);
    return NextResponse.json(
      { message: "Error fetching dashboard details" },
      { status: 500 }
    );
  }
}

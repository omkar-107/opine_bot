// /api/student/gettasks/[username]/route.ts

import connectToDatabase from "@/utils/db";
import FeedbackTask from "@/models/FeedbackTask";
import Student from "@/models/Student";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
  const uname = req.nextUrl.pathname.split("/").pop();
  if (!uname) {
    return NextResponse.json(
      { message: "Please provide username" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  try {
    const result = await Student.aggregate([
      { $match: { username: uname } }, // Find the Student with the given ID
      {
        $lookup: {
          from: "feedbacktasks", // Name of the course collection
          localField: "student_courses", // Field in Student containing course IDs
          foreignField: "course_id", // Field in FeedbackTasks containing the course ID
          as: "courseDetails", // Name of the array in the result containing matched documents
        },
      },
      {
        $project: {
          name: 1,
          courseDetails: {
            _id: 1,
            title: 1,
            course_id: 1,
            created_by: 1,
            active: 1,
          },
        },
      },
    ]);

    const data = result[0].courseDetails;
    console.log(data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { message: "Error fetching student" },
      { status: 500 }
    );
  }
}

// /api/student/gettasks/[username]/route.ts

import connectToDatabase from "@/utils/db";
import FeedbackTask from "@/models/FeedbackTask";
import Feedback from "@/models/Feedback";
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
    // console.log(data);

    //for each task loop through the feedbacks and check if it is already completed or not by student
    const notCompletedTasks = [];
    for (const task of data) {
      const feedback = await Feedback.findOne({
        for_task: task._id,
        given_by: uname,
      });

      // Add task to the array if feedback is not found or not completed
      if (!feedback || !feedback.completed) {
        notCompletedTasks.push(task);
      }
    }
    console.log(notCompletedTasks);
    return NextResponse.json(notCompletedTasks, { status: 200 });
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { message: "Error fetching student" },
      { status: 500 }
    );
  }
}

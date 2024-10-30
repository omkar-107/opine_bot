import connectToDatabase from "@/utils/db";
import Feedback from "@/models/Feedback";
import FeedbackTask from "@/models/FeedbackTask";
import Course from "@/models/Course";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username");
  try {
    await connectToDatabase();
    const feedbacks = await Feedback.find(
      {
        username: username,
        completed: true,
      },
      {
        user_chat: 0,
        gpt_chat: 0,
        summary: 0,
        timestamp: 0,
      }
    );

    //for each for_task in feedbacks get the title of the task
    for (let i = 0; i < feedbacks.length; i++) {
      const task = await FeedbackTask.findOne({
        _id: feedbacks[i].for_task,
      });
      const course = await Course.findOne({ id_: feedbacks[i].for_course });
      feedbacks[i] = {
        ...feedbacks[i]._doc,
        task_title: task.title,
        course: course.title,
      };
    }
    return NextResponse.json({ feedbacks }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch feedbacks" },
      { status: 500 }
    );
  }
}

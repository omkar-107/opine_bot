import connectToDatabase from "@/utils/db";
import FeedbackTask from "@/models/FeedbackTask";
import Student from "@/models/Student";
import Feedback from "@/models/Feedback";
import Course from "@/models/Course";
import { NextRequest, NextResponse } from "next/server";
import { authorizeFeedbackId } from "@/utils/auth";

export async function GET(req: NextRequest) {
  const feedbackId = req.nextUrl.pathname.split("/").pop();
  if (!feedbackId) {
    return NextResponse.json(
      { message: "Please provide feedbackId" },
      { status: 400 }
    );
  }

  const isAuthorized = await authorizeFeedbackId(
    req.cookies.get("auth")?.value,
    feedbackId
  );
  if (!isAuthorized) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  try {
    const feedback = await Feedback.findOne({ _id: feedbackId });
    if (!feedback) {
      return NextResponse.json(
        { message: "Feedback not found" },
        { status: 404 }
      );
    }
    const course = await Course.findOne({ id_: feedback.for_course });

    return NextResponse.json({
      feedbackId: feedback._id,
      givenBy: feedback.given_by,
      forTask: feedback.for_task,
      forCourse: feedback.for_course,
      course: course.title,
      faculty: feedback.faculty,
      timestamp: feedback.timestamp,
      user_chat: feedback.user_chat,
      gpt_chat: feedback.gpt_chat,
      syllabus: course.syllabus,
    });
  } catch (error) {
    console.error("Error getting feedback details:", error);
    return NextResponse.json(
      { message: "Error getting feedback details" },
      { status: 500 }
    );
  }
}

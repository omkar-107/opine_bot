import connectToDatabase from "@/utils/db";
import FeedbackTask from "@/models/FeedbackTask";
import Student from "@/models/Student";
import Feedback from "@/models/Feedback";
import Course from "@/models/Course";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const feedbackId = req.nextUrl.pathname.split("/").pop();
  if (!feedbackId) {
    return NextResponse.json(
      { message: "Please provide feedbackId" },
      { status: 400 }
    );
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
      syllabus: course.syllabus,
      faculty: feedback.faculty,
      timestamp: feedback.timestamp,
      user_chat: feedback.user_chat,
      gpt_chat: feedback.gpt_chat,
    });
  } catch (error) {
    console.error("Error getting feedback details:", error);
    return NextResponse.json(
      { message: "Error getting feedback details" },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {
  const feedbackId = req.nextUrl.pathname.split("/").pop();
  if (!feedbackId) {
    return NextResponse.json(
      { message: "Please provide feedbackId" },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();
    console.log("Database connected successfully");

    const feedbackData = await req.json();
    console.log("feedbackData", feedbackData);

    // Flatten the feedbackData structure
    const flattenedFeedbackData = {
      given_by: feedbackData.feedbackData.givenBy,
      for_task: feedbackData.feedbackData.forTask,
      for_course: feedbackData.feedbackData.forCourse,
      faculty: feedbackData.feedbackData.faculty,
      timestamp: feedbackData.feedbackData.timestamp,
      user_chat: feedbackData.feedbackData.user_chat,
      gpt_chat: feedbackData.feedbackData.gpt_chat,
      summary: feedbackData.feedbackData.summary,
    };

    const feedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      flattenedFeedbackData,
      { new: true, upsert: true }
    );

    console.log("feedback is", feedback);
    if (!feedback) {
      console.error("Feedback not found or not updated");
      return NextResponse.json(
        { message: "Feedback not found or not updated" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Feedback updated successfully",
      feedback,
    });
  } catch (error) {
    console.error("Error updating feedback details:", error);
    return NextResponse.json(
      { message: "Error updating feedback details" },
      { status: 500 }
    );
  }
}
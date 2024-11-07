import connectToDatabase from "@/utils/db";
import FeedbackTask from "@/models/FeedbackTask";
import Student from "@/models/Student";
import Feedback from "@/models/Feedback";
import Course from "@/models/Course";
import { NextRequest, NextResponse } from "next/server";
import { authorizeFeedbackId } from "@/utils/auth";

export async function POST(req: NextRequest) {
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
      completed: feedbackData.feedbackData.completed,
      completedAt: feedbackData.feedbackData.completedAt,
    };

    const feedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      flattenedFeedbackData,
      { new: true, upsert: true }
    );

    const feedbackTask = await FeedbackTask.findOne({
      _id: feedbackData.feedbackData.forTask,
    });

    feedbackTask.feedbacks.push(feedbackId);
    await feedbackTask.save();

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

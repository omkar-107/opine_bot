import connectToDatabase from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import FeedbackTask from "@/models/FeedbackTask";

export async function POST(req: NextRequest, res: NextResponse) {
  const { taskid, status } = await req.json();
  if (!taskid || typeof status !== "boolean") {
    return NextResponse.json(
      { message: "Please provide taskid and status" },
      { status: 400 }
    );
  }
  await connectToDatabase();

  try {
    const feedbackTask = await FeedbackTask.findOne({ _id: taskid });
    if (!feedbackTask) {
      return NextResponse.json(
        { message: "Feedback task not found" },
        { status: 404 }
      );
    }
    feedbackTask.active = status;
    await feedbackTask.save();
    return NextResponse.json(feedbackTask);
  } catch (error) {
    console.error("Error updating feedback task status:", error);
    return NextResponse.json(
      { message: "Error updating feedback task status" },
      { status: 500 }
    );
  }
}

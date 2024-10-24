import connectToDatabase from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import FeedbackTask from "@/models/FeedbackTask";

export async function GET(req: NextRequest, res: NextResponse) {
  const taskid = req.nextUrl.pathname.split("/").pop();
  if (!taskid) {
    return NextResponse.json(
      { message: "Please provide taskid" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  try {
    const feedbackTask = await FeedbackTask.findOne({
      _id: taskid,
    });
    if (!feedbackTask) {
      return NextResponse.json(
        { message: "Feedback task not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(feedbackTask);
  } catch (error) {
    console.error("Error getting feedback task:", error);
    return NextResponse.json(
      { message: "Error getting feedback task" },
      { status: 500 }
    );
  }
}

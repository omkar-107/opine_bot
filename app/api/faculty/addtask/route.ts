// /api/faculty/addtask/route.ts

import connectToDatabase from "@/utils/db";
import FeedbackTask from "@/models/FeedbackTask";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  const { title, course_id, created_by, active } = await req.json();

  if (!title || !course_id || !created_by || !active) {
    return NextResponse.json(
      { message: "Please fill in all fields" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  try {
    const newFeedbackTask = new FeedbackTask({
      title,
      course_id,
      created_by,
      active,
      feedbacks: [],
    });

    await newFeedbackTask.save();

    return NextResponse.json(newFeedbackTask);
  } catch (error) {
    console.error("Error creating feedback task:", error);
    return NextResponse.json(
      { message: "Error creating feedback task" },
      { status: 500 }
    );
  }
}

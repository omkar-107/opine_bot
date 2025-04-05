import connectToDatabase from "@/utils/db";
import FeedbackTask from "@/models/FeedbackTask";
import { NextRequest, NextResponse } from "next/server";
import { act } from "react";
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const tasks = await FeedbackTask.find(
      {},
      {
        _id: 1,
        title: 1,
        created_by: 1,
        course_id: 1,
        active: 1,
      }
    );

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching feedbacktasks:", error);
    return NextResponse.json(
      { message: "Error fetching feedbacktasks" },
      { status: 500 }
    );
  }
}

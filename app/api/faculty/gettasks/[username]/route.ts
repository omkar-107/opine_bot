// /api/faculty/gettasks/[username]/route.ts

import connectToDatabase from "@/utils/db";
import FeedbackTask from "@/models/FeedbackTask";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
  const username = req.nextUrl.pathname.split("/").pop();
  if (!username) {
    return NextResponse.json(
      { message: "Please provide username" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  try {
    const feedbackTasks = await FeedbackTask.find({ created_by: username });

    return NextResponse.json(feedbackTasks);
  } catch (error) {
    console.error("Error getting feedback tasks:", error);
    return NextResponse.json(
      { message: "Error getting feedback tasks" },
      { status: 500 }
    );
  }
}

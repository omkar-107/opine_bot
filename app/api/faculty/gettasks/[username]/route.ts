// /api/faculty/gettasks/[username]/route.ts

import connectToDatabase from "@/utils/db";
import FeedbackTask from "@/models/FeedbackTask";
import { NextRequest, NextResponse } from "next/server";
import {authorizeUsername} from "@/utils/auth";

export async function GET(req: NextRequest, res: NextResponse) {
  const username = req.nextUrl.pathname.split("/").pop();
  if (!username) {
    return NextResponse.json(
      { message: "Please provide username" },
      { status: 400 }
    );
  }

  const isAuthorized = await authorizeUsername(
    req.cookies.get("auth")?.value,
    username
  );
  if (!isAuthorized) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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

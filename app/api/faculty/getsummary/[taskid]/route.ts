import connectToDatabase from "@/utils/db";
import Feedback from "@/models/Feedback";
import { NextRequest, NextResponse } from "next/server";
import { authorizeTaskId } from "@/utils/auth";
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, res: NextResponse) {
  const taskid = req.nextUrl.pathname.split("/").pop();
  if (!taskid) {
    return NextResponse.json(
      { message: "Please provide taskid" },
      { status: 400 }
    );
  }

  const isAuthorized = await authorizeTaskId(
    req.cookies.get("auth")?.value,
    taskid
  );
  if (!isAuthorized) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  try {
    const summaries = await Feedback.find({ for_task: taskid }, { summary: 1 });

    return NextResponse.json(summaries);
  } catch (error) {
    console.error("Error getting feedback summaries:", error);
    return NextResponse.json(
      { message: "Error getting feedback summaries" },
      { status: 500 }
    );
  }
}

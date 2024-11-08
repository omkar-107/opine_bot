import connectToDatabase from "@/utils/db";
import Feedback from "@/models/Feedback";
import { NextRequest, NextResponse } from "next/server";
import { authorizeTaskId } from "@/utils/auth";

export async function POST(req: NextRequest, res: NextResponse) {
    let feedbacktaskId;
    try {
        const bodyText = await req.text();
        if (!bodyText) {
          throw new Error("Empty body");
        }
        const body = JSON.parse(bodyText);
        feedbacktaskId = body.feedbacktaskId;
      } catch (error) {
        console.error("Invalid JSON input:", error);
        return NextResponse.json(
          { message: "Invalid JSON input" },
          { status: 400 }
        );
      }
  
  if (!feedbacktaskId) {
    return NextResponse.json(
      { message: "Please provide taskid" },
      { status: 400 }
    );
  }

  

  await connectToDatabase();

  try {
    const summaries = await Feedback.find({ for_task: feedbacktaskId }, { summary: 1 });
    let avg = 0;
    for (let i = 0; i < summaries.length; i++) {
      avg += summaries[i].summary.rating;
    }
    avg = avg / summaries.length;
    return NextResponse.json({ avg,summaries }, { status: 200 });
  } catch (error) {
    console.error("Error getting feedback summaries:", error);
    return NextResponse.json(
      { message: "Error getting feedback summaries" },
      { status: 500 }
    );
  }
}

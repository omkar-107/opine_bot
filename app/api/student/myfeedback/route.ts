import connectToDatabase from "@/utils/db";
import Feedback from "@/models/Feedback";
import { NextRequest, NextResponse } from "next/server";
import { SunMedium } from "lucide-react";

export async function POST(req: NextRequest, res: NextResponse) {
  const { task_id, given_by, for_course, faculty } = await req.json();

  if (!task_id || !given_by || !for_course || !faculty) {
    return NextResponse.json(
      { message: "Please fill in all fields" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  try {
    const feedback = await Feedback.findOne({
      for_task: task_id,
      given_by: given_by,
      for_course: for_course,
    });

    if (feedback) {
      console.log("Feedback already exists");
      return NextResponse.json({ feedbackId: feedback._id });
    } else {
      const newFeedback = new Feedback({
        for_task: task_id,
        given_by: given_by,
        for_course: for_course,
        faculty: faculty,
        timestamp: new Date().toISOString(),
        user_chat: [],
        gpt_chat: [],
        summary: "",
      });
      await newFeedback.save();
      console.log("Feedback created");
      return NextResponse.json({ feedbackId: newFeedback._id, newFeedback });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
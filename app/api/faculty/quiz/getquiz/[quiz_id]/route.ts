import connectToDatabase from "@/utils/db";
import Quiz from "@/models/Quiz";
import { NextRequest, NextResponse } from "next/server";
import { authorizeFaculty } from "@/utils/auth";
import mongoose from "mongoose";
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const quiz_id = req.nextUrl.pathname.split("/").pop();

  if (!quiz_id || !mongoose.Types.ObjectId.isValid(quiz_id)) {
    return NextResponse.json(
      { message: "Invalid or no quiz id" },
      { status: 400 }
    );
  }

  // Connect to database
  await connectToDatabase();

  try {
    const quiz = await Quiz.findById(quiz_id);

    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    const isAuthorized = await authorizeFaculty(
      req.cookies.get("auth")?.value,
      quiz.created_by_id
    );

    if (!isAuthorized) {
      return NextResponse.json(
        { message: "Unauthorized Quiz Access" },
        { status: 401 }
      );
    }

    return NextResponse.json(quiz, { status: 200 });
  } catch (error) {
    console.error("Error fetching quiz details:", error);
    return NextResponse.json(
      { message: "Error fetching quiz details" },
      { status: 500 }
    );
  }
}

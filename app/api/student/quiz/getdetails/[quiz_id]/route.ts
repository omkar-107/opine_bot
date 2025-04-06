import connectToDatabase from "@/utils/db";
import Quiz from "@/models/Quiz";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { quiz_id: string } }
) {
  // Get quiz_id from URL params
  const { quiz_id } = params;

  if (!quiz_id) {
    return NextResponse.json(
      { message: "Quiz ID is required" },
      { status: 400 }
    );
  }

  //check if quiz_id is a valid ObjectId of mongodb
  if (!/^[0-9a-fA-F]{24}$/.test(quiz_id)) {
    return NextResponse.json(
      { message: "Invalid Quiz ID format" },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const quiz = await Quiz.findById(quiz_id);

    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        quiz: {
          _id: quiz._id,
          title: quiz.title,
          num_questions: quiz.num_questions,
          created_by_username: quiz.created_by_username,
          course_name: quiz.course_name,
          active: quiz.active,
          time: quiz.time, // Duration in minutes
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching quiz details:", error);
    return NextResponse.json(
      { message: "Error fetching quiz details" },
      { status: 500 }
    );
  }
}

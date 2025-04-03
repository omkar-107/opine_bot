import connectToDatabase from "@/utils/db";
import QuizResponse from "@/models/QuizResponse";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/utils/auth";

interface IFeedbackRequest {
  feedback: string;
}

export async function POST(
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

  const token = req.cookies.get("auth")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Authentication token is missing" },
      { status: 401 }
    );
  }

  const user = await getUserFromToken(token);
  if (!user) {
    return NextResponse.json(
      { message: "Invalid authentication token" },
      { status: 401 }
    );
  }

  try {
    // Parse request body to get feedback
    const requestData: IFeedbackRequest = await req.json();

    if (!requestData.feedback) {
      return NextResponse.json(
        { message: "No feedback provided" },
        { status: 400 }
      );
    }

    const stu_email = user.email;

    if (!stu_email) {
      return NextResponse.json(
        { message: "Student email is required" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find the student's quiz response
    const quizResponse = await QuizResponse.findOne({
      quiz_id: quiz_id,
      email: stu_email,
    });

    if (!quizResponse) {
      return NextResponse.json(
        {
          message:
            "Quiz response not found. You need to submit the quiz before providing feedback.",
        },
        { status: 404 }
      );
    }

    // Update the feedback field
    quizResponse.feedback = requestData.feedback;
    await quizResponse.save();

    return NextResponse.json(
      { message: "Feedback submitted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting quiz feedback:", error);
    return NextResponse.json(
      { message: "Error submitting quiz feedback" },
      { status: 500 }
    );
  }
}

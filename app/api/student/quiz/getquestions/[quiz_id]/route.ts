import connectToDatabase from "@/utils/db";
import Quiz, { IQuiz } from "@/models/Quiz";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import QuizResponse from "@/models/QuizResponse";
export const dynamic = 'force-dynamic';

// Define an interface for the question structure
interface IQuestion {
  _id: mongoose.Types.ObjectId;
  question_text: string;
  options: string[];
  correct_answer: string;
}

// Define an interface for sanitized questions (without correct answers)
interface ISanitizedQuestion {
  _id: mongoose.Types.ObjectId;
  question_text: string;
  options: string[];
}

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

  // Check if the student is authorized to access this quiz
  const quizAuthCookie = req.cookies.get(`quiz_auth`)?.value;

  if (!quizAuthCookie) {
    return NextResponse.json(
      {
        message: "Quiz authorization not found. Please enter quiz code first.",
      },
      { status: 401 }
    );
  }

  try {
    const authData = JSON.parse(quizAuthCookie);

    // Verify that cookie data is valid
    if (!authData.authorized || !authData.stu_email || !authData.quiz_id) {
      return NextResponse.json(
        {
          message: "Invalid quiz authorization. Please enter quiz code again.",
        },
        { status: 401 }
      );
    }

    //verify that the quiz_id in the cookie matches the one in the URL
    if (authData.quiz_id !== quiz_id) {
      return NextResponse.json(
        { message: "Unauthorized access to this quiz" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Find the quiz by its ID
    const quiz = await Quiz.findById(quiz_id);

    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    // Check if the quiz is active
    if (!quiz.active) {
      return NextResponse.json(
        { message: "This quiz is not currently active" },
        { status: 403 }
      );
    }

    // Check if student has already submitted a response for this quiz
    const existingResponse = await QuizResponse.findOne({
      quiz_id: quiz_id,
      email: authData.stu_email,
    });

    if (existingResponse) {
      return NextResponse.json(
        { message: "You have already submitted answers for this quiz" },
        { status: 409 }
      );
    }

    // Prepare quiz questions by removing correct answers
    const sanitizedQuestions: ISanitizedQuestion[] = quiz.questions.map(
      (question: IQuestion) => ({
        _id: question._id,
        question_text: question.question_text,
        options: question.options,
        // excluding correct_answer
      })
    );

    // Return quiz data without sensitive information
    return NextResponse.json(
      {
        quiz: {
          _id: quiz._id,
          title: quiz.title,
          course_name: quiz.course_name,
          num_questions: quiz.num_questions,
          time: quiz.time, // Duration in minutes
          questions: sanitizedQuestions,
          syllabus: quiz.syllabus || "",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching quiz questions:", error);
    return NextResponse.json(
      { message: "Error fetching quiz questions" },
      { status: 500 }
    );
  }
}

import connectToDatabase from "@/utils/db";
import Quiz from "@/models/Quiz";
import QuizResponse, { IQuizResponse } from "@/models/QuizResponse";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

// Define an interface for the question structure in Quiz model
interface IQuestion {
  _id: mongoose.Types.ObjectId;
  question_text: string;
  options: string[];
  correct_answer: string;
}

interface ISubmitAnswerRequest {
  answers: {
    question_id: string;
    question_text: string;
    selected_option: string;
  }[];
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

    if (authData.quiz_id !== quiz_id) {
      return NextResponse.json(
        {
          message: "Quiz ID in cookie does not match the provided quiz ID.",
        },
        { status: 401 }
      );
    }

    const stu_email = authData.stu_email;

    // Connect to database
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
      email: stu_email,
    });

    if (existingResponse) {
      return NextResponse.json(
        { message: "You have already submitted answers for this quiz" },
        { status: 409 }
      );
    }

    // Parse request body to get answers
    const requestData: ISubmitAnswerRequest = await req.json();

    if (
      !requestData.answers ||
      !Array.isArray(requestData.answers) ||
      requestData.answers.length === 0
    ) {
      return NextResponse.json(
        { message: "No answers provided" },
        { status: 400 }
      );
    }

    // Calculate the score and mark correct/incorrect answers
    const answersWithCorrectness = requestData.answers.map((answer) => {
      const question = quiz.questions.find(
        (q: IQuestion) =>
          q._id.toString() === answer.question_id ||
          q.question_text === answer.question_text
      );

      const isCorrect = question
        ? question.correct_answer === answer.selected_option
        : false;

      return {
        question_text: answer.question_text,
        selected_option: answer.selected_option,
        correct: isCorrect,
      };
    });

    // Calculate the score
    const totalQuestions = quiz.num_questions;
    const correctAnswers = answersWithCorrectness.filter(
      (answer) => answer.correct
    ).length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Create new quiz response
    const quizResponse = new QuizResponse({
      quiz_id: quiz_id,
      email: stu_email,
      answers: answersWithCorrectness,
      score: score,
      submitted_at: new Date(),
    });

    // Save the quiz response
    const savedResponse = await quizResponse.save();

    // Update quiz.responses with the new response ID
    await Quiz.findByIdAndUpdate(
      quiz_id,
      {
        $push: {
          responses: savedResponse._id,
        },
      },
      { new: true }
    );

    // Clear the quiz authorization cookie after submission
    const response = NextResponse.json(
      {
        message: "Quiz answers submitted successfully",
        score: score,
        totalQuestions: totalQuestions,
        correctAnswers: correctAnswers,
      },
      { status: 200 }
    );

    // Clear the authorization cookie
    response.cookies.set({
      name: `quiz_auth`,
      value: "",
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error submitting quiz answers:", error);
    return NextResponse.json(
      { message: "Error submitting quiz answers" },
      { status: 500 }
    );
  }
}

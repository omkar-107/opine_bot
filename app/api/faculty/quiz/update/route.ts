import connectToDatabase from "@/utils/db";
import Quiz from "@/models/Quiz";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const { _id, title, quiz_code, time, syllabus, questions } =
      await req.json();

    // Validate input fields
    if (
      !_id ||
      !title ||
      !quiz_code ||
      !time ||
      !questions ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return NextResponse.json(
        { message: "Invalid input. Please check all fields." },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find the quiz by ID
    const existingQuiz = await Quiz.findById(_id);

    if (!existingQuiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    // Check if quiz is active - prevent editing if it's currently in progress
    if (existingQuiz.active) {
      return NextResponse.json(
        { message: "Cannot edit an active quiz" },
        { status: 400 }
      );
    }

    // Update quiz with new values
    existingQuiz.title = title;
    existingQuiz.quiz_code = quiz_code;
    existingQuiz.time = time;
    existingQuiz.syllabus = syllabus || "";
    existingQuiz.questions = questions;
    existingQuiz.num_questions = questions.length;
    existingQuiz.updatedAt = new Date();

    // Save the updated quiz
    await existingQuiz.save();

    return NextResponse.json(
      {
        message: "Quiz updated successfully",
        quiz: existingQuiz,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating quiz:", error);

    return NextResponse.json(
      { message: "Error updating quiz" },
      { status: 500 }
    );
  }
}

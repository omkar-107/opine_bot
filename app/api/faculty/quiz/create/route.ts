import connectToDatabase from "@/utils/db";
import Quiz from "@/models/Quiz";
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const {
      title,
      num_questions,
      created_by_id,
      created_by_username,
      course_id,
      course_name,
      time,
      syllabus,
      questions,
    } = await req.json();

    // Validate input fields
    if (
      !title ||
      !num_questions ||
      !created_by_id ||
      !created_by_username ||
      !course_id ||
      !course_name ||
      !time ||
      !questions ||
      !Array.isArray(questions) ||
      questions.length !== num_questions
    ) {
      return NextResponse.json(
        { message: "Invalid input. Please check all fields." },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Generate a unique quiz code
    const quiz_code = nanoid(8); // Generates an 8-character unique code

    // Create a new quiz
    const newQuiz = new Quiz({
      quiz_code,
      title,
      num_questions,
      created_by_id,
      created_by_username,
      course_id,
      course_name,
      active: false, // Default: quiz is inactive until started
      time,
      syllabus,
      started_on: null,
      ended_on: null,
      responses: [],
      questions,
    });

    // Save to database
    await newQuiz.save();

    return NextResponse.json(
      { message: "Quiz created successfully", quiz: newQuiz },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { message: "Error creating quiz" },
      { status: 500 }
    );
  }
}

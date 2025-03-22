import connectToDatabase from "@/utils/db";
import Quiz from "@/models/Quiz";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { verify } from "jsonwebtoken";
import { authorizeFaculty } from "@/utils/auth";

export async function GET(req: NextRequest) {
  const faculty_id = req.nextUrl.pathname.split("/").pop();

  // Validate if facultyId is a valid ObjectId
  if (!faculty_id || !mongoose.Types.ObjectId.isValid(faculty_id)) {
    return NextResponse.json(
      { message: "Invalid faculty ID format" },
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

  const isAuthorized = await authorizeFaculty(token, faculty_id);

  if (!isAuthorized) {
    return NextResponse.json(
      { message: "Unauthorized Access to GetAll" },
      { status: 401 }
    );
  }

  await connectToDatabase();

  try {
    const quizzes = await Quiz.find({
      created_by: new mongoose.Types.ObjectId(faculty_id),
    });

    if (!quizzes.length) {
      return NextResponse.json(
        { message: "No quizzes found for this faculty" },
        { status: 404 }
      );
    }

    return NextResponse.json(quizzes, { status: 200 });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { message: "Error fetching quizzes" },
      { status: 500 }
    );
  }
}

import connectToDatabase from "@/utils/db";
import Quiz from "@/models/Quiz";
import Student from "@/models/Student";
import Course from "@/models/Course";
import { NextRequest, NextResponse } from "next/server";
import { authorizeStudent } from "@/utils/auth";
import QuizResponse from "@/models/QuizResponse";
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const stu_email = req.nextUrl.pathname.split("/").pop();

  // Validate if student email is provided
  if (!stu_email) {
    return NextResponse.json(
      { message: "Student email is required" },
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

  // Authorize the student
  const isAuthorized = await authorizeStudent(token, stu_email);

  if (!isAuthorized) {
    return NextResponse.json(
      { message: "Unauthorized access" },
      { status: 401 }
    );
  }

  await connectToDatabase();

  try {
    // Find the student by email
    const student = await Student.findOne({ email: stu_email });

    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    // Get student's courses
    const studentCourses = student.student_courses;
    console.log("Student courses:", studentCourses);

    // Find all courses that match the course codes in student_courses
    const courses = await Course.find({ id_: { $in: studentCourses } });

    // Extract course IDs
    const courseIds = courses.map((course) => course._id);
    console.log("Course IDs:", courseIds);
    // Get current date
    const currentDate = new Date();

    // Fetch active quizzes for the student's courses
    const activeQuizzes = await Quiz.find(
      {
        course_id: { $in: courseIds },
        active: true,
        //   start_time: { $lte: currentDate },
        //   end_time: { $gte: currentDate },
      },
      {
        quiz_code: 0,
        syllabus: 0,
        responses: 0,
        questions: 0,
        createdAt: 0,
        updatedAt: 0,
      }
    );
    console.log("Active quizzes:", activeQuizzes);

    // Get IDs of active quizzes
    const quizIds = activeQuizzes.map((quiz) => quiz._id);

    // Find responses from this student for any of the active quizzes
    const studentResponses = await QuizResponse.find({
      quiz_id: { $in: quizIds },
      email: stu_email,
    });
    console.log("Student responses:", studentResponses);

    // Create an array of quiz IDs that the student has already responded to
    const respondedQuizIds = studentResponses.map((response) =>
      response.quiz_id.toString()
    );

    // Filter out quizzes that the student has already responded to
    const availableQuizzes = activeQuizzes.filter(
      (quiz) => !respondedQuizIds.includes(quiz._id.toString())
    );

    console.log("Available quizzes (not yet responded):", availableQuizzes);

    if (!availableQuizzes.length) {
      return NextResponse.json(
        { message: "No active quizzes found for this student" },
        { status: 200 }
        // Returning 200 with empty array instead of 404 since it's a valid scenario
      );
    }

    return NextResponse.json(
      {
        quizzes: availableQuizzes,
        total: availableQuizzes.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching active quizzes:", error);
    return NextResponse.json(
      { message: "Error fetching active quizzes" },
      { status: 500 }
    );
  }
}

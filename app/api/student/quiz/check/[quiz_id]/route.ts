import Course from "@/models/Course";
import Quiz from "@/models/Quiz";
import QuizResponse from "@/models/QuizResponse";
import Student from "@/models/Student";
import { authorizeStudent, getUserFromToken } from "@/utils/auth";
import connectToDatabase from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { quiz_id: string } }
) {
  // Get quiz_id from URL params
  const { quiz_id } = params;
  console.log("Quiz ID:", quiz_id);

  if (!quiz_id) {
    return NextResponse.json(
      { message: "Quiz ID is required" },
      { status: 400 }
    );
  }

  try {
    // Get student token from cookies
    const token = req.cookies.get("auth")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Authentication token is missing" },
        { status: 401 }
      );
    }

    // Verify the token and get student email
    let user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json(
        { message: "Invalid authentication token" },
        { status: 401 }
      );
    }

    const stu_email = user.email;
    console.log("Student email:", stu_email);

    // Get quiz code from request body
    const { quiz_code } = await req.json();

    if (!quiz_code) {
      return NextResponse.json(
        { message: "Quiz code is required" },
        { status: 400 }
      );
    }

    if (!stu_email) {
      return NextResponse.json(
        { message: "Student email is required" },
        { status: 400 }
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

    // Find the student by email
    const student = await Student.findOne({ email: stu_email });

    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

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

    // Check if the quiz belongs to one of the student's courses
    const studentCourses = student.student_courses;

    const courseOfQuiz = await Course.findOne({
      _id: quiz.course_id,
    });

    if (!courseOfQuiz) {
      return NextResponse.json(
        { message: "Course not found for this quiz" },
        { status: 404 }
      );
    }

    const isCourseEnrolled = studentCourses.some(
      (course: String) => course === courseOfQuiz.id_
    );

    if (!isCourseEnrolled) {
      return NextResponse.json(
        { message: "You are not enrolled in this course" },
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

    // Check if the quiz code matches
    if (quiz.quiz_code !== quiz_code) {
      return NextResponse.json(
        { message: "Invalid quiz code" },
        { status: 403 }
      );
    }

    // If all checks pass, set a cookie for quiz authorization
    const response = NextResponse.json(
      {
        message: "Quiz access authorized",
        quiz: {
          id: quiz._id,
          title: quiz.title,
          time: quiz.time,
          num_questions: quiz.num_questions,
          course_name: quiz.course_name,
        },
      },
      { status: 200 }
    );

    // Set a cookie that will be used to authorize this student for this quiz
    // The cookie expires after the quiz duration (in minutes)
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + quiz.time);

    response.cookies.set({
      name: `quiz_auth`,
      value: JSON.stringify({
        stu_email,
        quiz_id: quiz._id,
        authorized: true,
        timestamp: new Date().toISOString(),
      }),
      expires: expiryTime,
      path: "/",
      httpOnly: true,
      //   secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return response;
  } catch (error) {
    console.error("Error checking quiz authorization:", error);
    return NextResponse.json(
      { message: "Error checking quiz authorization" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { quiz_id: string } }
) {
  // Get quiz_id from URL params
  const { quiz_id } = params;

  const token = req.cookies.get("auth")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Authentication token is missing" },
      { status: 401 }
    );
  }

  // Check if the student is authorized to access this quiz
  const quizAuthCookie = req.cookies.get(`quiz_auth`)?.value;

  if (!quizAuthCookie) {
    return NextResponse.json(
      { message: "Quiz authorization not found", authorized: false },
      { status: 401 }
    );
  }

  try {
    const authData = JSON.parse(quizAuthCookie);

    // Verify that cookie data is valid and not expired
    if (!authData.authorized || !authData.stu_email || !authData.quiz_id) {
      return NextResponse.json(
        { message: "Invalid quiz authorization", authorized: false },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        message: "Quiz authorization verified",
        authorized: true,
        stu_email: authData.stu_email,
        quiz_id: authData.quiz_id,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid quiz authorization data", authorized: false },
      { status: 401 }
    );
  }
}

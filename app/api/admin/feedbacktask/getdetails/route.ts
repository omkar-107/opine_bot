import connectToDatabase from "@/utils/db";
import Feedback from "@/models/Feedback";
import Student from "@/models/Student";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  const { feedbacktaskId, courseId } = await req.json();

  if (!feedbacktaskId || !courseId) {
    return NextResponse.json(
      { message: "Please provide both feedbacktaskId and course_id" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  try {
    // Step 1: Get all students enrolled in the course
    const enrolledStudents = await Student.find({
      student_courses: courseId,
    }).select("email username branch year semester");
    console.log("enrolledStudents", enrolledStudents);

    // Step 2: Get list of students who have given feedback for the specified task and completed it
    const feedbackGiven = await Feedback.find({
      for_task: feedbacktaskId,
      completed: true,
    })
      .select("given_by")
      .lean();

    console.log("feedbackGiven", feedbackGiven);

    // Extract the student IDs who have given feedback
    const feedbackGivenIds = feedbackGiven.map((f) => f.given_by);

    console.log("feedbackGivenIds", feedbackGivenIds);

    // Step 3: Divide students based on feedback completion
    const studentsWhoGaveFeedback = enrolledStudents.filter((student) =>
      feedbackGivenIds.includes(student.username)
    );

    console.log("studentsWhoGaveFeedback", studentsWhoGaveFeedback);

    const studentsWhoDidNotGiveFeedback = enrolledStudents.filter(
      (student) => !feedbackGivenIds.includes(student.username)
    );

    console.log("studentsWhoDidNotGiveFeedback", studentsWhoDidNotGiveFeedback);

    // Respond with both lists
    return NextResponse.json(
      {
        studentsWhoGaveFeedback,
        studentsWhoDidNotGiveFeedback,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching feedback data:", error);
    return NextResponse.json(
      { message: "Error fetching feedback data" },
      { status: 500 }
    );
  }
}

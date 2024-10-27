import connectToDatabase from "@/utils/db";
import Student from "@/models/Student";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Get username from URL path
    const username = req.nextUrl.pathname.split("/").pop();

    // Validate username
    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Find and delete the student
    const deletedStudent = await Student.findOneAndDelete({ username });

    // Check if student was found and deleted
    if (!deletedStudent) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Return success response
    return NextResponse.json(
      { 
        message: "Student deleted successfully",
        data: deletedStudent 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
}
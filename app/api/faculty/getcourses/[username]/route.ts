// /api/faculty/getcourses/[username]/route.ts

import connectToDatabase from "@/utils/db";
import Faculty from "@/models/Faculty";
import { NextRequest, NextResponse } from "next/server";
import { authorizeUsername } from "@/utils/auth";

export async function GET(req: NextRequest, res: NextResponse) {
  const username = req.nextUrl.pathname.split("/").pop();
  if (!username) {
    return NextResponse.json(
      { message: "Please provide username" },
      { status: 400 }
    );
  }

  const isAuthorized = await authorizeUsername(
    req.cookies.get("auth")?.value,
    username
  );
  if (!isAuthorized) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  try {
    const faculty = await Faculty.findOne({ username });
    if (!faculty) {
      return NextResponse.json(
        { message: "Faculty not found" },
        { status: 404 }
      );
    }
    const result = await Faculty.aggregate([
      { $match: { username: username } }, // Find the faculty with the given ID
      {
        $lookup: {
          from: "courses", // Name of the course collection
          localField: "faculty_courses", // Field in Faculty containing course IDs
          foreignField: "id_", // Field in Course containing the course ID
          as: "courseDetails", // Name of the array in the result containing matched documents
        },
      },
      {
        $project: {
          name: 1,
          courseDetails: { id_: 1, title: 1, _id: 1 }, // Only keep the title from the matched courses
        },
      },
    ]);

    const data = result[0].courseDetails;
    console.log(data);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error getting courses:", error);
    return NextResponse.json(
      { message: "Error getting courses" },
      { status: 500 }
    );
  }
}

import connectToDatabase from "@/utils/db";
import Faculty from "@/models/Faculty";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
  const username = req.nextUrl.pathname.split("/").pop();
  if (!username) {
    return NextResponse.json(
      { message: "Please provide username" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  try {
    const faculty = await Faculty.findOne({ username }, { password: 0 });
    if (!faculty) {
      return NextResponse.json(
        { message: "Faculty not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(faculty);
  } catch (error) {
    return NextResponse.json(
      { message: "Error getting faculty" },
      { status: 500 }
    );
  }
}

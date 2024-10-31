import connectToDatabase from "@/utils/db";
import Faculty from "@/models/Faculty";
import { NextRequest, NextResponse } from "next/server";
import {authorizeUsername} from "@/utils/auth";

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

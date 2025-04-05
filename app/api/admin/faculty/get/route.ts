import connectToDatabase from "@/utils/db";
import Faculty from "@/models/Faculty";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, res: NextResponse) {
  await connectToDatabase();

  try {
    const faculties = await Faculty.find(
      {},
      { username: 1, department: 1, faculty_courses: 1 }
    );
    return NextResponse.json(faculties);
  } catch (error) {
    console.error("Error fetching faculties:", error);
    return NextResponse.json(
      { message: "Error fetching faculties" },
      { status: 500 }
    );
  }
}

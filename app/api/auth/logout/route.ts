import { NextRequest, NextResponse } from 'next/server';
import { serialize } from "cookie";

export async function POST(req: NextRequest) {
  
  const serialized = serialize(process.env.COOKIE_NAME || 'auth', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: -1, 
    path: "/",
  });

  return NextResponse.json({ message: 'Logged out successfully' }, { 
    status: 200, 
    headers: { "Set-Cookie": serialized } 
  });
}
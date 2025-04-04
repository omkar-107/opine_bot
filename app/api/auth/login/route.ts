import connectToDatabase from '@/utils/db';
import User from '@/models/User';
import { NextRequest,NextResponse } from 'next/server';
import { serialize } from "cookie";
import { sign } from "jsonwebtoken";
import bcrypt from 'bcryptjs';


const secretKey = process.env.AUTH_SECRET || 'secret';
const MAX_AGE = 60 * 60 * 24 * 30;




export async function POST(req: NextRequest, res: NextResponse) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ message: 'Please fill in all fields' }, { status: 400 });
  }

  await connectToDatabase();

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
    }
    user.password = undefined;
    // Create the session
    const token = sign({user},secretKey, { expiresIn: MAX_AGE });
    const seralized = serialize(process.env.COOKIE_NAME || 'auth', token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: MAX_AGE,
      path: "/",
    });
   
    return NextResponse.json({ user, token,message: "logged in.." }, { status: 200, headers: { "Set-Cookie": seralized } });
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

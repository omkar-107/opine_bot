import connectToDatabase from '@/utils/db';
import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  let email: string;
  let password: string;
  let username: string;
  let confirmPassword: string;

  try {
    const body = await req.json();
    email = body.email;
    password = body.password;
    username = body.username;
    confirmPassword = body.confirmPassword;
  } catch (e) {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  if (!email || !password || !username || !confirmPassword) {
    console.log('Please fill in all fields');
    return NextResponse.json({ message: 'Please fill in all fields' }, { status: 400 });
  }

  await connectToDatabase();

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json({ message: 'User email already exists' }, { status: 400 });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return NextResponse.json({ message: 'Username already exists' }, { status: 400 });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await User.create({ email, password: hashedPassword, username });

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

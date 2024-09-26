import connectToDatabase from '@/utils/db';
import { NextRequest,NextResponse } from 'next/server';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req : NextRequest) {
 
  let email: string;
  let password: string;

  try {
    const body = await req.json();
    email = body.email;
    password = body.password;
  } catch (e) {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  if (!email || !password) {
    console.log('Please fill in all fields');
    return NextResponse.json({ message: 'Please fill in all fields' }, { status: 400 });
  }
  await connectToDatabase();

  try {
    
   
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

   
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await User.create({ email, password: hashedPassword });

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

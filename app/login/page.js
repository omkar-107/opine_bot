'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import signup from "../signup/page.js";
import LoginIcon from "@/public/assets/LoginIcon.png"
import Image from 'next/image.js';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      if (data.user.role === 'student' || data.user.role === 'faculty') {
        router.push('/dashboard');
      }
      else {
        router.push('/admin');
      }
    } else {
      setError(data.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex max-w-4xl shadow-lg rounded-lg overflow-hidden bg-white">
        {/* Left Section */}
        <div className="w-full md:w-1/2 p-8">
          <h1 className="mb-6 text-3xl font-semibold text-center">Log in to your Account</h1>
          <p className="mb-2 text-center text-gray-500">
            Welcome back!
          </p>
          <p className='mb-6 text-center'>

            Select method to log in:
          </p>

          <div className="flex space-x-4 justify-center mb-6">
            <button className="w-1/2 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">
              <img
                src="https://img.icons8.com/color/48/000000/google-logo.png"
                alt="Google"
                className="inline-block w-5 mr-2"
              />
              Google
            </button>
            <button className="w-1/2 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">
              <img
                src="https://img.icons8.com/fluency/48/000000/linkedin.png"
                alt="Linkedin"
                className="inline-block w-5 mr-2"
              />
              Linkedin
            </button>
          </div>

          {error && <p className="mb-4 text-red-500 text-center">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-600">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-600">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-blue-500 hover:underline">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Log in
            </button>
          </form>

          <p className="mt-6 text-center text-gray-500">
            Don't have an account?{' '}
            <a href="/signup" className="text-blue-500 hover:underline">
              Create an account
            </a>
          </p>
        </div>

        {/* Right Section */}
        <div className="hidden md:block w-1/2 bg-blue-600 p-8 text-white">
          <div className="flex items-center justify-center h-full">
            <div className="text-center mt-2">

              {/* <p className=" text-lg">
                 lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc vel tincidunt lacinia, nunc nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nunc vel tincidunt lacinia, nunc nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nunc vel tincidunt lacinia, nunc nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nunc vel tincidunt lacinia, nunc nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nunc vel tincidunt lacinia, nunc nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nunc vel tincidunt lacinia, nunc nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nunc vel tincidunt lacinia, nunc nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.

                </p> */}
              <Image
                src={LoginIcon}
                alt="Login Icon"
                width={150}
                height={150}
                className=""
              />

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

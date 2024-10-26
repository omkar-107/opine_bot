'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// import Image from 'next/image';



export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // const handleChange = (e) => {
  //   const { name, value, type, checked } = e.target;
  //   setFormData(prev => ({
  //     ...prev,
  //     [name]: type === 'checkbox' ? checked : value
  //   }));
  //   setEmail()
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
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
      }  else {
        router.push('/admin');
      }
    }
    else {
      setError(data.message);
    }
  }catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputClasses = "w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#9c89ff] bg-gray-50/50";

  return (
    <div className="h-screen bg-[#ddd8ff] p-6 flex items-center justify-center">
      <div className="w-full h-[500px] max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden flex ">
        {/* Left (Form) section */}
        <div className="w-full md:w-1/2 p-8 max-w-md rounded-3xl overflow-hidden">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-sm" />
            </div>
            <h1 className="text-2xl font-semibold">Sign In</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <input
                type="email"
                name="email"
                value={email}
                // onChange={handleChange}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className={inputClasses}
              />
            </div>

            <div className="space-y-2 relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                // onChange={handleChange}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className={inputClasses}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-2.5 text-gray-500"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                name="rememberMe"
                // checked={formData.rememberMe}
                // onChange={handleChange}
                className="rounded text-purple-600 focus:ring-purple-500 mr-2"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#9c89ff] text-gray-800 py-3 rounded-2xl font-medium hover:bg-[#7b61ff] transition-colors disabled:opacity-50"
            >
              {isLoading ? "Logging in..." : "Log in"}
            </button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <a href="/signup" className="text-[#7b61ff] hover:underline">
                Create account
              </a>
            </div>
          </form>
        </div>

        {/* Right (Gradient) section */}
        <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-[#9c89ff] to-[#ddd8ff] p-8 relative">
          {/* <Image
            src="/assets/LoginIcon.png"
            alt="Login Icon"
            width={200}
            height={200}
            priority
            className="object-contain"
          /> */}
        </div>
      </div>
    </div>
  );
}
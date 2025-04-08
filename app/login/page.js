'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, RefreshCw, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import login from "../../public/assets/login.png";


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingState, setLoadingState] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const router = useRouter();

  useEffect(() => {
    return () => {
      setIsLoading(false);
      setLoadingState('idle');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingState('loading');
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
        setLoadingState('success');
        if (data.user.role === 'student' || data.user.role === 'faculty') {
          router.push('/dashboard');
        } else {
          router.push('/admin');
        }
      } else {
        setLoadingState('error');
        setError(data.message);
        setIsLoading(false);
      }
    } catch (err) {
      setLoadingState('error');
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRefresh = () => {
    setEmail('');
    setPassword('');
    setError('');
    setIsLoading(false);
    setLoadingState('idle');
  };

  
{/* Refresh Button */}
const [isRotating, setIsRotating] = useState(false);


// Add this function to your component
const handleRefreshClick = () => {
  setIsRotating(true);
  handleRefresh();
  
  // Reset the animation after it completes
  setTimeout(() => {
    setIsRotating(false);
  }, 500);
};

  const handleBack = () => {
    router.back();
  };

  const inputClasses = "w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50/50 disabled:opacity-50 disabled:cursor-not-allowed";

  const getButtonContent = () => {
    switch (loadingState) {
      case 'loading':
        return (
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Signing in...</span>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Success!</span>
          </div>
        );
      default:
        return 'Sign In';
    }
  };

  const getButtonClasses = () => {
    const baseClasses = "w-full py-3 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center";

    switch (loadingState) {
      case 'loading':
        return `${baseClasses} bg-blue-500 text-white cursor-not-allowed`;
      case 'success':
        return `${baseClasses} bg-green-500 text-white`;
      case 'error':
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700`;
      default:
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700`;    }
  };

  return (
    <div className="h-screen bg-blue-200 p-6 flex items-center justify-center">
      <div className="w-full h-[500px] max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden flex">
        {/* Left (Form) section */}
        <div className="w-full md:w-1/2 p-8 max-w-md rounded-3xl overflow-hidden relative">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {/* Back Button */}
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                <span className="text-sm">Back</span>
              </button>
              
              {/* Refresh Button */}
              <button
  onClick={handleRefreshClick}
  className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
  aria-label="Refresh form"
  disabled={isLoading}
>
  <RefreshCw className={`w-5 h-5 transition-transform duration-500 ${isRotating ? 'rotate-180' : ''}`} />
</button>

            </div>
            <h1 className="text-2xl font-semibold">Sign In</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                disabled={isLoading}
                className={inputClasses}
              />
            </div>

            <div className="space-y-2 relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                disabled={isLoading}
                className={inputClasses}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
                className="absolute right-3 top-2.5 text-gray-500 disabled:opacity-50"
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
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={getButtonClasses()}
            >
              {getButtonContent()}
            </button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <span className=" text-blue-600  hover:text-blue-700 ">
                Contact Admin
              </span>
            </div>
          </form>
          
          {/* Border line - only visible on md screens and up */}
          <div className="hidden md:block absolute top-0 right-0 w-px h-full bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200" />
        </div>

        {/* Right (Image) section with gradient overlay */}
        <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-[#9c89ff]/90 to-[#ddd8ff]/90 relative overflow-hidden">
          {/* Add the image here */}
          <div className="absolute inset-0 z-0">
            <Image 
              src={login}
              alt="Login illustration" 
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
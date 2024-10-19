'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      router.replace('/login');
    } else {
      setError(data.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg flex overflow-hidden max-w-4xl w-full">
        {/* Left Section */}
        <div className="hidden md:flex md:w-1/2 bg-blue-600 items-center justify-center p-10">
          <div className="text-center">
           
          </div>
        </div>

        {/* Right Section (Form) */}
        <div className="w-full md:w-1/2 p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Create Your Account</h1>

          <div className="flex gap-4 mb-4">
            <button className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
            <img
                src="https://img.icons8.com/color/48/000000/google-logo.png"
                alt="Google"
                className="inline-block w-5 mr-2"
              />
              Continue with Google
            </button>
            <button className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
            <img
                src="https://img.icons8.com/fluency/48/000000/linkedin.png"
                alt="Linkedin"
                className="inline-block w-5 mr-2"
              />
              Continue with Linkedin
            </button>
          </div>

          <div className="flex items-center my-6">
            <div className="border-t w-full"></div>
            <p className="px-4 text-sm text-gray-500">Or</p>
            <div className="border-t w-full"></div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">Name</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4 flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-600 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-600 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center mb-6">
              <input type="checkbox" id="terms" required className="mr-2" />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-blue-500 hover:underline">
                  Terms & Conditions
                </a>
              </label>
            </div>

            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-blue-500 hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

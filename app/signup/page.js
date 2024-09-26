'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      router.replace('/login');
    } else {
      setError(data.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
  <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-md">
    <h1 className="mb-6 text-2xl font-bold text-center text-white">Sign Up</h1>
    {error && <p className="mb-4 text-red-400 text-center">{error}</p>}
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-300">Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring focus:ring-blue-500 text-white"
        />
      </div>
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-300">Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring focus:ring-blue-500 text-white"
        />
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
      >
        Sign Up
      </button>
    </form>
  </div>
</div>

  );
}

'use client';
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        router.replace('/login');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setLoading(false);
      setError('Something went wrong. Please try again.');
    }
  };

  const inputClasses = "w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#9c89ff] bg-gray-50/50";

  return (
    <div className="min-h-screen bg-[#ddd8ff] p-6 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden flex">

        <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-[#9c89ff] to-[#ddd8ff] p-8 relative">
          
        </div>

      
        <div className="w-full md:w-1/2 p-8 max-w-md mx-auto rounded-3xl overflow-hidden">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-sm" />
           
            </div>
            <h1 className="text-2xl font-semibold">Create account</h1>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Full name"
                required
                className={inputClasses}
              />
            </div>

            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                required
                className={inputClasses}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type={showPassword.password ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  minLength={8}
                  className={inputClasses}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('password')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword.password ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="flex-1 relative">
                <input
                  type={showPassword.confirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                  minLength={8}
                  className={inputClasses}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword.confirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input type="checkbox" id="terms" required className="mr-2" />
              <label htmlFor="terms" className="text-sm text-gray-600">
                By creating an account you agree to EduConvo's{' '}
                <a href="#" className="text-[#7b61ff] hover:underline">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="text-[#7b61ff] hover:underline">Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#9c89ff] text-gray-800 py-3 rounded-2xl font-medium hover:bg-[#7b61ff] transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
            </div>

          </form>

          <div className="text-sm text-center mt-6">
            Have an account?{' '}
            <a href="/login" className="text-[#7b61ff] hover:underline">Log in</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
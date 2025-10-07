import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminLoginFormProps {
  onSuccess?: () => void;
}

export function AdminLoginForm({ onSuccess }: AdminLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const { signIn, signUp, resendVerification, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = isSignUp 
      ? await signUp(email, password)
      : await signIn(email, password);
    
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      if (isSignUp) {
        setError('Account created! Please check your email to verify your account before signing in.');
        setIsSignUp(false);
        setLoading(false);
      } else {
        onSuccess?.();
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await resetPassword(resetEmail || email);
    if (error) {
      setError(error.message);
    } else {
      setError('Password reset email sent! Check your inbox.');
    }
    setLoading(false);
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await resendVerification(verificationEmail);
    
    if (error) {
      setError(error.message);
    } else {
      setError('Verification email sent! Check your inbox.');
    }
    setLoading(false);
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Forgot Password</h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
            <div>
              <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-300">Email Address</label>
              <input
                id="resetEmail"
                name="resetEmail"
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>

            {error && (
              <div className={`text-sm ${error.includes('sent') ? 'text-green-400' : 'text-red-400'}`}>{error}</div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Email'}
              </button>
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (showEmailVerification) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Resend Verification Email
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleResendVerification}>
            <div>
              <label htmlFor="verificationEmail" className="block text-sm font-medium text-gray-300">
                Email Address
              </label>
              <input
                id="verificationEmail"
                name="verificationEmail"
                type="email"
                required
                value={verificationEmail}
                onChange={(e) => setVerificationEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>

            {error && (
              <div className={`text-sm ${error.includes('sent') ? 'text-green-400' : 'text-red-400'}`}>
                {error}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Verification Email'}
              </button>
              <button
                type="button"
                onClick={() => setShowEmailVerification(false)}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            {isSignUp ? 'Create Admin Account' : 'Admin Sign In'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {isSignUp 
              ? 'Create a new admin account (you will need to be manually approved)'
              : 'Sign in to access the admin panel'
            }
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error && (
            <div className={`text-sm ${error.includes('created') ? 'text-green-400' : 'text-red-400'}`}>
              {error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading 
                ? (isSignUp ? 'Creating account...' : 'Signing in...') 
                : (isSignUp ? 'Create Account' : 'Sign In')
              }
            </button>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div className="flex justify-center space-x-4 text-sm">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-indigo-400 hover:text-indigo-300"
              >
                Forgot Password?
              </button>
              <button
                type="button"
                onClick={() => setShowEmailVerification(true)}
                className="text-indigo-400 hover:text-indigo-300"
              >
                Resend Verification
              </button>
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setEmail('');
                  setPassword('');
                }}
                className="text-sm text-gray-400 hover:text-white"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Create one"
                }
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

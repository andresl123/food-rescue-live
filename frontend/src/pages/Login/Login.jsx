import React from 'react';
import useLogin from './useLogin.js';
import FormInput from '../../components/FormInput.jsx';
import PrimaryButton from '../../components/PrimaryButton.jsx';
import OAuthButton from '../../components/OAuthButton.jsx';

function LoginPage({ onLoginSuccess, navigate }) {
  const {
    username,
    setUsername,
    password,
    setPassword,
    loading,
    error,
    successMessage,
    handleLogin,
    handleOAuthLogin
  } = useLogin({ onLoginSuccess });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-gray-100">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2 font-inter">
            Welcome Back
          </h1>
          <p className="text-gray-500">
            Sign in to continue to your Spring-powered dashboard.
          </p>
        </div>

        {/* Display Messages */}
        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-xl" role="alert">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}
        {successMessage && (
          <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-xl" role="alert">
            <span className="font-bold">Success:</span> {successMessage}
          </div>
        )}

        {/* --- OAuth Buttons (NEW) --- */}
        <div className="mb-8">
            <OAuthButton provider="Google" onClick={handleOAuthLogin} />
        </div>

        {/* Divider */}
        <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">
                    Or continue with
                </span>
            </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <FormInput
            id="username"
            label="Email or Username"
            type="email"
            placeholder="Enter your email"
            icon="mail"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />

          <FormInput
            id="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            icon="lock"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <div className="flex justify-between items-center text-sm pt-2">
            <label className="flex items-center text-gray-600">
              <input type="checkbox" className="mr-2 rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500" />
              Remember me
            </label>
            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-150">
              Forgot Password?
            </a>
          </div>

          <PrimaryButton type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging In...
              </span>
            ) : (
              'Log In'
            )}
          </PrimaryButton>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Not a member?{' '}
          <a href="#" onClick={() => navigate('home')} className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-150">
            Go to Home
          </a>
        </div>
        <p className="mt-4 text-xs text-gray-400 text-center">
            Simulated Path: /src/pages/Login/Login.jsx
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
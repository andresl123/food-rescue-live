import { useState } from 'react';
import { Link } from 'react-router-dom';

function EnterCode() {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Handle code verification logic here
    console.log('Verifying code:', code);

    // Example logic
    if (code === '123456') {
      setMessage('Code verified successfully! You can now reset your password.');
      //
    } else {
      setError('Invalid verification code. Please try again.');
    }
    setCode('');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Enter Verification Code</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please enter the code you received via email.
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <div className="mt-1">
              <input
                id="verification-code"
                name="verification-code"
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Verify Code
            </button>
          </div>
        </form>
        {message && <p className="text-sm text-center text-green-500">{message}</p>}
        {error && <p className="text-sm text-center text-red-500">{error}</p>}
        <div className="text-sm text-center">
          <Link to="/" className="font-medium text-indigo-600 hover:text-indigo-500">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EnterCode;
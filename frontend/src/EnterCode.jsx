import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function EnterCode() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Note: A better endpoint would be one that verifies the token
      // and returns a success status without needing a separate page.
      // For now, we are assuming this endpoint is for verification.
      console.log('Verifying code:', code);
      // In a real app, you would hit a verification endpoint.
      // For this flow, we'll navigate directly to the next step.
      if (!code) {
        throw new Error("Please enter a code.");
      }

      // On success, navigate to the next step, passing the code along
      navigate('/set-new-password', { state: { token: code } });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
              disabled={loading}
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {loading ? 'Verifying...' : 'Continue'}
            </button>
          </div>
        </form>
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
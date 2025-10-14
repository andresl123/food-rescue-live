import React from 'react';

const OAuthButton = React.memo(({ provider, onClick }) => {
  const isGoogle = provider === 'Google';
  const color = isGoogle ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500/50' : 'bg-gray-700 hover:bg-gray-800 focus:ring-gray-700/50';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full py-3 px-4 text-white font-semibold rounded-xl transition duration-300 transform
        shadow-md hover:shadow-lg focus:outline-none focus:ring-4 text-sm
        flex items-center justify-center space-x-3 ${color}
      `}
    >
      {/* Inline SVG for Google Logo */}
      {isGoogle &&
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.346c-1.378 3.197-3.696 5.567-6.792 6.55L35.292 41A23.998 23.998 0 0 0 44 24c0-1.251-.23-2.43-.611-3.567z"/>
          <path fill="#FF3D00" d="M6.309 34.026l6.812-5.183a14.07 14.07 0 0 1-.365-2.001c0-.734.12-1.442.365-2.115l-6.732-5.183A23.957 23.957 0 0 0 4 24c0 3.731 1.144 7.234 3.053 10.026z"/>
          <path fill="#4CAF50" d="M24 44a23.957 23.957 0 0 0 15.391-5.696l-6.812-5.183A15.939 15.939 0 0 1 24 36c-3.149 0-6.104-1.503-7.989-4.072l-6.812 5.183A23.95 23.95 0 0 0 24 44z"/>
          <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.346c-1.378 3.197-3.696 5.567-6.792 6.55L35.292 41A23.998 23.998 0 0 0 44 24c0-1.251-.23-2.43-.611-3.567z"/>
          <path fill="#1565C0" d="M24 4A23.957 23.957 0 0 0 4.389 15.917l6.812 5.183A15.939 15.939 0 0 1 24 12c3.149 0 6.104 1.503 7.989 4.072l6.812-5.183A23.95 23.95 0 0 0 24 4z"/>
        </svg>
      }
      <span>Sign in with {provider}</span>
    </button>
  );
});

export default OAuthButton;
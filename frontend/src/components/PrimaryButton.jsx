import React from 'react';

const PrimaryButton = React.memo(({ children, onClick, disabled, type = 'button' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`
      w-full py-3 px-4 text-white font-semibold rounded-xl transition duration-300 transform
      shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/50
      ${disabled ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'}
    `}
  >
    {children}
  </button>
));

export default PrimaryButton;
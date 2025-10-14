import React from 'react';
import PrimaryButton from '../../components/PrimaryButton.jsx';

const HomePage = React.memo(({ username, onLogout }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-10 text-center">
      <h1 className="text-4xl font-extrabold text-indigo-700 tracking-tight mb-4">
        Welcome, {username}!
      </h1>
      <p className="text-gray-600 mb-8">
        You are successfully logged in via the Spring Boot backend. This is your protected dashboard.
      </p>
      <PrimaryButton onClick={onLogout}>
        Log Out
      </PrimaryButton>
      <p className="mt-6 text-sm text-gray-400">
        Simulated Path: /src/pages/Home/Home.jsx
      </p>
    </div>
  </div>
));

export default HomePage;
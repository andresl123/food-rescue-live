import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import ResetPassword from './ResetPassword';
import ChangePassword from './ChangePassword';
import EnterCode from './EnterCode'; // 1. Import the new component

function Home() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <nav className="flex justify-center gap-4 mt-4">
        <Link to="/reset-password">Reset Password</Link>
        <Link to="/change-password">Change Password</Link>
        <Link to="/verify-code">Enter Code</Link>
      </nav>
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/verify-code" element={<EnterCode />} /> {/* 2. Add the new route */}
    </Routes>
  );
}

export default App;
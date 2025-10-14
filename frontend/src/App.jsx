import React from 'react';
import AppRouter from './routes/Router.jsx';

export default function App() {
  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
          html, body, #root {
            height: 100%;
          }
          body {
            font-family: 'Inter', sans-serif;
            background-color: #f9fafb;
          }
        `}
      </style>
      <AppRouter />
    </>
  );
}
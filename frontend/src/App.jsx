import React, { useState } from 'react';

// Update the import paths to include the .jsx extension
import RequestCodeForm from './components/RequestCodeForm.jsx';
import ResetPasswordForm from './components/ResetPasswordForm.jsx';

import './App.css';

function App() {
  const [view, setView] = useState('request');
  const [emailForReset, setEmailForReset] = useState('');

  const handleEmailSubmitted = (submittedEmail) => {
    setEmailForReset(submittedEmail);
    setView('reset');
  };

  return (
    <div className="App">
      <header className="App-header">
        {view === 'request' ? (
          <RequestCodeForm onEmailSubmitted={handleEmailSubmitted} />
        ) : (
          <ResetPasswordForm email={emailForReset} />
        )}
      </header>
    </div>
  );
}

export default App;
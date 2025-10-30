import React, { createContext, useContext, useState } from 'react';

// Create a context for job data flow
const JobDataContext = createContext();

// Provider component to wrap the app
export const JobDataProvider = ({ children }) => {
  const [currentJob, setCurrentJob] = useState(null);
  const [verificationType, setVerificationType] = useState(null); // 'pickup' or 'delivery'
  const [onVerificationComplete, setOnVerificationComplete] = useState(null); // Callback function

  const setJobForVerification = (job, type, callback = null) => {
    setCurrentJob(job);
    setVerificationType(type);
    setOnVerificationComplete(() => callback);
  };

  const clearJobData = () => {
    setCurrentJob(null);
    setVerificationType(null);
    setOnVerificationComplete(null);
  };

  return (
    <JobDataContext.Provider value={{
      currentJob,
      verificationType,
      setJobForVerification,
      clearJobData,
      onVerificationComplete
    }}>
      {children}
    </JobDataContext.Provider>
  );
};

// Hook to use job data context
export const useJobData = () => {
  const context = useContext(JobDataContext);
  if (!context) {
    throw new Error('useJobData must be used within a JobDataProvider');
  }
  return context;
};

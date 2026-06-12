import React, { createContext, useContext, useState } from 'react';

const FeatureFlagContext = createContext({});

export const FeatureFlagProvider = ({ children }) => {
  // Define your flags here. Add new flags as needed.
  const [flags, setFlags] = useState({
    newDashboard: true, // example flag
    darkModeToggle: true,
  });

  const setFlag = (name, value) => {
    setFlags((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <FeatureFlagContext.Provider value={{ flags, setFlag }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const useFeatureFlags = () => useContext(FeatureFlagContext);

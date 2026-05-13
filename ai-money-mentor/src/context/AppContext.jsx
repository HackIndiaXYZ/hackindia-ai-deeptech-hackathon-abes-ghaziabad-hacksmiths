import React, { createContext, useReducer, useContext } from 'react';

const initialState = {
  userData: {},
  healthScore: null,
  lifeSimulatorData: null,
  taxData: null,
  personalityData: null,
  currentPage: '/',
  hasCompletedOnboarding: false,
  demoData: null,
};

const AppContext = createContext();

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER_DATA':
      return { ...state, userData: { ...state.userData, ...action.payload } };
    case 'SET_HEALTH_SCORE':
      return { ...state, healthScore: action.payload };
    case 'SET_LIFE_DATA':
      return { ...state, lifeSimulatorData: action.payload };
    case 'SET_TAX_DATA':
      return { ...state, taxData: action.payload };
    case 'SET_PERSONALITY':
      return { ...state, personalityData: action.payload };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'COMPLETE_ONBOARDING':
      return { ...state, hasCompletedOnboarding: true };
    case 'SET_DEMO_DATA':
      return { ...state, demoData: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}


import React, { createContext, useContext, useState } from 'react';

export interface AccessibilityProfile {
  visualImpairment: boolean;
  hearingImpairment: boolean;
  mobilityImpairment: boolean;
  cognitiveImpairment: boolean;
  preferredInterface: 'voice' | 'visual' | 'simplified';
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  userType: 'passenger' | 'driver';
  accessibilityNeeds: AccessibilityProfile;
  emergencyContacts: Contact[];
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

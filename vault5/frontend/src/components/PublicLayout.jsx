import React from 'react';
import NavBar from './NavBar';

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <main>
        {children}
      </main>
    </div>
  );
};

export default PublicLayout;
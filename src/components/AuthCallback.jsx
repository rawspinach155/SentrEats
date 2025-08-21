import React, { useEffect, useState } from 'react';

const AuthCallback = () => {
  const [status, setStatus] = useState('Processing authentication...');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const user = urlParams.get('user');
    const error = urlParams.get('message');

    if (error) {
      setStatus(`Authentication failed: ${error}`);
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
      return;
    }

    if (token && user) {
      try {
        const userData = JSON.parse(decodeURIComponent(user));
        
        // Store authentication data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setStatus('Authentication successful! Redirecting...');
        
        // Redirect to main app
        setTimeout(() => {
          window.location.href = '/';
          window.location.reload();
        }, 1500);
        
      } catch (error) {
        console.error('Error parsing user data:', error);
        setStatus('Error processing authentication data');
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    } else {
      setStatus('No authentication data received');
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f6f8] flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-[#382c5c] to-[#2a1f45] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <img src="/sentry-glyph.png" alt="SentrEats Logo" className="w-8 h-8" />
        </div>
        
        <h2 className="text-xl font-semibold text-[#181225] mb-4">Authentication</h2>
        
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#382c5c] mx-auto mb-4"></div>
        
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  );
};

export default AuthCallback;

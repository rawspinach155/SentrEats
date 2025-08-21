import React, { useEffect, useState } from 'react';

const AuthCallback = () => {
  const [status, setStatus] = useState('Processing authentication...');

  useEffect(() => {
    console.log('AuthCallback: Component mounted');
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const user = urlParams.get('user');
    const error = urlParams.get('message');
    
    console.log('AuthCallback: URL params:', { token: token ? 'present' : 'missing', user: user ? 'present' : 'missing', error });

    if (error) {
      setStatus(`Authentication failed: ${error}`);
      setTimeout(() => {
        window.location.replace('/');
      }, 3000);
      return;
    }

    if (token && user) {
      try {
        console.log('AuthCallback: Parsing user data...');
        const userData = JSON.parse(decodeURIComponent(user));
        console.log('AuthCallback: Parsed user data:', userData);
        
        // Store authentication data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('AuthCallback: Stored auth data in localStorage');
        
        setStatus('Authentication successful! Redirecting...');
        
        // Redirect to main app
        setTimeout(() => {
          console.log('AuthCallback: Redirecting to main app...');
          // Use replace to avoid back button issues
          window.location.replace('/');
        }, 1500);
        
        // Fallback redirect in case setTimeout fails
        setTimeout(() => {
          console.log('AuthCallback: Fallback redirect...');
          window.location.replace('/');
        }, 3000);
        
      } catch (error) {
        console.error('Error parsing user data:', error);
        setStatus('Error processing authentication data');
        setTimeout(() => {
          window.location.replace('/');
        }, 3000);
      }
    } else {
      setStatus('No authentication data received');
      setTimeout(() => {
        window.location.replace('/');
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

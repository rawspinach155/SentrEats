import React from 'react';

const SlackLogin = () => {
  const handleSlackLogin = () => {
    // Redirect to our backend Slack OAuth endpoint
    window.location.href = 'https://4604188c763a.ngrok-free.app/api/auth/slack';
  };

  return (
    <div className="min-h-screen bg-[#f6f6f8] flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#382c5c] to-[#2a1f45] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <img src="/sentry-glyph.png" alt="SentrEats Logo" className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold text-[#181225] mb-2">Welcome to SentrEats</h1>
          <p className="text-gray-600">Sign in to manage your eatery reviews</p>
        </div>

        {/* Slack Login Button */}
        <div className="text-center">
          <button
            onClick={handleSlackLogin}
            className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#382c5c] transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-3" 
              viewBox="0 0 122.8 122.8"
            >
              <path d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z" fill="#e01e5a"/>
              <path d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z" fill="#36c5f0"/>
              <path d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z" fill="#2eb67d"/>
              <path d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z" fill="#ecb22e"/>
            </svg>
            Sign in with Slack
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            By signing in, you agree to our terms of service and privacy policy
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-[#382c5c] rounded-full mr-3"></div>
            Track your favorite eateries
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-[#382c5c] rounded-full mr-3"></div>
            Share reviews with the community
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-[#382c5c] rounded-full mr-3"></div>
            Discover new places to eat
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlackLogin;

import React, { useEffect, useState } from 'react';
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useNavigate } from 'react-router-dom';

const FinalizeSignUp: React.FC = () => {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
      }
      if (email) {
        signInWithEmailLink(auth, email, window.location.href)
          .then(() => {
            window.localStorage.removeItem('emailForSignIn');
            setMessage('Email verified successfully. You can now sign in.');
            setTimeout(() => navigate('/signin'), 3000);
          })
          .catch((error) => {
            setError('Error verifying email. Please try again.');
            console.error(error);
          });
      }
    }
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full max-w-xs">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {message && <p className="text-green-500 mb-4">{message}</p>}
        {!error && !message && <p>Verifying your email...</p>}
      </div>
    </div>
  );
};

export default FinalizeSignUp;
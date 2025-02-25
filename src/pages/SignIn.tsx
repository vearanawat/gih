

///////
import React from "react";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  // Redirect user after sign-in based on role
  React.useEffect(() => {
    if (user) {
      const role = user?.unsafeMetadata?.role;
      if (role === "doctor") {
        navigate("/doctor-dashboard", { replace: true });
      } else if (role === "pharmacist") {
        navigate("/pharmacist-dashboard", { replace: true });
      } else {
        navigate("/patient-dashboard", { replace: true });
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-md flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-center mb-4">Sign In</h2>

        <SignedOut>
          <SignInButton mode="modal">
            <button className="w-full p-3 bg-green-600 text-white rounded transition-transform transform hover:scale-105">
              Sign In with Clerk
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <div className="text-center">
            <p className="text-gray-700 mb-4">You are already signed in.</p>
            <UserButton />
          </div>
        </SignedIn>
      </div>
    </div>
  );
};

export default SignInPage;

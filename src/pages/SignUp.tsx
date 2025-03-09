import React, { useState, useEffect } from "react";
import { SignedIn, SignedOut, SignUp, useSignUp, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoaded, signUp } = useSignUp();
  const { user, isSignedIn } = useUser();
  const [role, setRole] = useState<string>(() => {
    return localStorage.getItem("selectedRole") || "pharmacist"; 
  });

  const [isLoading, setIsLoading] = useState(true); // Prevent premature redirection

  // Handle role selection
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
    localStorage.setItem("selectedRole", selectedRole);
  };

    // Function to send email after signup
    const sendEmailAfterSignup = async (recipientEmail: string) => {
      try {
        await fetch('http://localhost:5000/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt: 'Generate a welcome email for signing up to MediFlow. The email should: 1. Have a warm welcome message thanking the user for signing up. 2. Introduce MediFlow as a platform providing assistance to pharmacists and doctors. 3. Highlight how the AI assistant helps pharmacists generate orders from prescriptions with recommendations. 4. Mention how it supports doctors in diagnosis and report analysis. 5. Encourage users to explore the platform and make the most of its features. 6. End with an appropriate sign-off. Format as a ready-to-send email ONLY without explanations or notes.',
            recipient: recipientEmail
          })
        });
        console.log("Email sent successfully");
      } catch (error) {
        console.error("Failed to send email:", error);
      }
    };
  // Ensure user metadata is available before redirecting
  useEffect(() => {
    if (!isSignedIn || !user) return;

    const fetchUserData = async () => {
      // await user.refresh(); // Ensure latest user data
      let userRole = user.unsafeMetadata?.role as string || localStorage.getItem("selectedRole") || "patient";
     console.log("userRole",userRole);
     
      // If role is missing, update Clerk metadata
      if (!user.unsafeMetadata?.role) {
        try {
          await user.update({
            unsafeMetadata: {
              ...user.unsafeMetadata,
              role: userRole,
            },
          });
        } catch (error) {
          console.error("Failed to update user metadata:", error);
        }
      }

      // Save in localStorage
      localStorage.setItem("userType", userRole);
      localStorage.setItem("userId", user.id);


            // Send email after signup
            await sendEmailAfterSignup(user.primaryEmailAddress?.emailAddress || "");
      // Redirect based on role
      setTimeout(() => {
        switch (userRole) {
          case "doctor":
            navigate("/doctor-dashboard", { replace: true });
          break;
          case "pharmacist":
            navigate("/pharmacist-dashboard", { replace: true });
          break;
        default:
            navigate("/patient-dashboard", { replace: true });
            break;
      }
      }, 1000); // Small delay to ensure role is set
  };

    fetchUserData();
    setIsLoading(false);
  }, [isSignedIn, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center mb-4">Sign Up</h2>

        <SignedOut>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Select Your Role</label>
            <select
              value={role}
              onChange={handleRoleChange}
              className="w-full p-2 border rounded"
            >
              <option value="pharmacist">Pharmacist</option>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          {/* Use SignUp component with unsafeMetadata */}
          <SignUp
            path="/signup"
            routing="path"
          
              unsafeMetadata= {{ role }}
            
          />
        </SignedOut>

        {isLoading ? (
          <p className="text-center text-gray-600 mt-4">Loading...</p>
        ) : (
          <SignedIn>
            <div className="text-center">
              <p>You are already signed in.</p>
              <button 
                onClick={() => {
                  const userRole = user?.unsafeMetadata?.role as string || localStorage.getItem("selectedRole") || "patient";

                  switch (userRole) {
                    case "doctor":
                      navigate("/doctor-dashboard");
                      break;
                    case "pharmacist":
                      navigate("/pharmacist-dashboard");
                      break;
                    default:
                      navigate("/patient-dashboard");
                      break;
                  }
                }}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Go to Dashboard
              </button>
            </div>
          </SignedIn>
        )}
        </div>
    </div>
  );
};

export default SignUpPage;

// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
// import { auth } from '@/lib/firebase';
// import { useUserRole } from '@/hooks/useUserRole';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { toast } from '@/components/ui/use-toast';

// const userRoles = [
//   {
//     id: 'patient',
//     title: 'Patient',
//     description: 'Access your medical records and book appointments',
//     path: '/patient-dashboard'
//   },
//   {
//     id: 'doctor',
//     title: 'Doctor',
//     description: 'Manage patient records and appointments',
//     path: '/doctor-dashboard'
//   },
//   {
//     id: 'pharmacist',
//     title: 'Pharmacist',
//     description: 'Process prescriptions and manage inventory',
//     path: '/pharmacist-dashboard'
//   }
// ] as const;

// export default function SignUp() {
//   const navigate = useNavigate();
//   const { role, setUserRole, isLoadingRole } = useUserRole();
//   const [isLoading, setIsLoading] = useState(false);
//   const [selectedRole, setSelectedRole] = useState<typeof userRoles[number]['id']>('patient');
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     firstName: '',
//     lastName: ''
//   });

//   // Monitor auth state and role changes
//   useEffect(() => {
//     if (!isLoadingRole && role) {
//       const roleConfig = userRoles.find(r => r.id === role);
//       if (roleConfig) {
//         console.log('Navigating to:', roleConfig.path);
//         navigate(roleConfig.path, { replace: true });
//       }
//     }
//   }, [role, isLoadingRole, navigate]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       // Create user account with Firebase
//       const { user } = await createUserWithEmailAndPassword(
//         auth,
//         formData.email,
//         formData.password
//       );

//       console.log('User created:', user.uid); // Debug log

//       toast({
//         title: 'Creating account...',
//         description: 'Please wait while we set up your account.',
//       });

//       // Set user role with retry
//       let roleSet = false;
//       for (let i = 0; i < 3; i++) {
//         try {
//           roleSet = await setUserRole(selectedRole);
//           if (roleSet) break;
//           await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
//         } catch (error) {
//           console.warn(`Attempt ${i + 1} failed:`, error);
//         }
//       }

//       if (!roleSet) {
//         throw new Error('Failed to set user role after multiple attempts');
//       }

//       console.log('Role set successfully:', selectedRole); // Debug log

//       toast({
//         title: 'Account created successfully!',
//         description: `Welcome to MediFlow, ${formData.firstName}!`,
//       });

//       // Force navigation after a short delay
//       setTimeout(() => {
//         const roleConfig = userRoles.find(r => r.id === selectedRole);
//         if (roleConfig) {
//           console.log('Forcing navigation to:', roleConfig.path); // Debug log
//           window.location.href = roleConfig.path;
//         }
//       }, 1500);
      
//     } catch (error: any) {
//       console.error('Error during sign up:', error);
//       toast({
//         title: 'Error creating account',
//         description: error.message || 'An error occurred during sign up. Please try again.',
//         variant: 'destructive',
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <Card className="max-w-lg mx-auto p-6">
//         <h1 className="text-2xl font-bold mb-6">Create your account</h1>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="space-y-4">
//             <div>
//               <Label htmlFor="firstName">First Name</Label>
//               <Input
//                 id="firstName"
//                 value={formData.firstName}
//                 onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
//                 required
//               />
//             </div>
//             <div>
//               <Label htmlFor="lastName">Last Name</Label>
//               <Input
//                 id="lastName"
//                 value={formData.lastName}
//                 onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
//                 required
//               />
//             </div>
//             <div>
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 value={formData.email}
//                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                 required
//               />
//             </div>
//             <div>
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 id="password"
//                 type="password"
//                 value={formData.password}
//                 onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                 required
//                 minLength={6}
//               />
//             </div>
//           </div>

//           <div className="space-y-4">
//             <Label>Select your role</Label>
//             <div className="grid gap-4">
//               {userRoles.map((role) => (
//                 <div
//                   key={role.id}
//                   className={`p-4 border rounded-lg cursor-pointer ${
//                     selectedRole === role.id ? 'border-primary bg-primary/5' : ''
//                   }`}
//                   onClick={() => setSelectedRole(role.id)}
//                 >
//                   <h3 className="font-medium">{role.title}</h3>
//                   <p className="text-sm text-gray-500">{role.description}</p>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <Button type="submit" className="w-full" disabled={isLoading}>
//             {isLoading ? 'Creating account...' : 'Create account'}
//           </Button>
//         </form>
//       </Card>
//     </div>
//   );
// }

////////////////////


// import React, { useState } from 'react';
// import { useSignUp } from '@clerk/clerk-react';
// import { useNavigate } from 'react-router-dom';

// const SignUpPage: React.FC = () => {
//   const { signUp, isLoaded } = useSignUp();
//   const [formData, setFormData] = useState({ email: '', password: '', role: 'patient' });
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!isLoaded) return;
    
//     setError('');
//     setIsLoading(true);

//     try {
//       await signUp.create({
//         emailAddress: formData.email,
//         password: formData.password,
//       });

//       await signUp.update({ unsafeMetadata: { role: formData.role } });

//       const { createdSessionId } = await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

//       if (!createdSessionId) throw new Error('Verification failed');

//       if (formData.role === 'doctor') navigate('/doctor-dashboard', { replace: true });
//       else if (formData.role === 'pharmacist') navigate('/pharmacist-dashboard', { replace: true });
//       else navigate('/patient-dashboard', { replace: true });

//     } catch (error: any) {
//       setError(error.errors?.[0]?.message || 'Failed to sign up');
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-md">
//         <h2 className="text-2xl font-bold text-center mb-4">Sign Up</h2>
//         {error && <p className="text-red-600 text-center">{error}</p>}
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input type="email" name="email" required onChange={handleInputChange} placeholder="Email" className="w-full p-3 border rounded" />
//           <input type="password" name="password" required onChange={handleInputChange} placeholder="Password" className="w-full p-3 border rounded" />
//           <select name="role" value={formData.role} onChange={handleInputChange} className="w-full p-3 border rounded">
//             <option value="patient">Patient</option>
//             <option value="doctor">Doctor</option>
//             <option value="pharmacist">Pharmacist</option>
//           </select>
//           <button type="submit" disabled={isLoading} className="w-full p-3 bg-blue-600 text-white rounded">
//             {isLoading ? 'Signing Up...' : 'Sign Up'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default SignUpPage;
 
// ///////////\
// import React, { useState, useEffect } from "react";
// import { SignedIn, SignedOut, SignUp, useSignUp, useUser } from "@clerk/clerk-react";
// import { useNavigate } from "react-router-dom";

// const SignUpPage: React.FC = () => {
//   const navigate = useNavigate();
//   const { isLoaded, signUp } = useSignUp();
//   const { user, isSignedIn } = useUser();
//   const [role, setRole] = useState<string>("pharmacist"); // Default role to Pharmacist
//   const [isVerificationComplete, setIsVerificationComplete] = useState(false); // Track verification

//   // Handle role selection
//   const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setRole(e.target.value);
//   };

//   // Track user verification status
//   useEffect(() => {
//     if (signUp && signUp.status === "complete") {
//       setIsVerificationComplete(true);
//     }
//   }, [signUp]);

//   // Redirect user only **after full sign-up & verification**
//   useEffect(() => {
//     if (isSignedIn && isVerificationComplete && user) {
//       const userRole = user.unsafeMetadata?.role;

//       if (userRole === "doctor") {
//         navigate("/doctor-dashboard", { replace: true });
//       } else if (userRole === "pharmacist") {
//         navigate("/pharmacist-dashboard", { replace: true });
//       } else {
//         navigate("/patient-dashboard", { replace: true });
//       }
//     }
//   }, [isSignedIn, isVerificationComplete, user, navigate]);

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-md">
//         <h2 className="text-2xl font-bold text-center mb-4">Sign Up</h2>

//         <SignedOut>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700">Select Your Role</label>
//             <select
//               value={role}
//               onChange={handleRoleChange}
//               className="w-full p-2 border rounded"
//             >
//               <option value="pharmacist">Pharmacist</option>
//               <option value="patient">Patient</option>
//               <option value="doctor">Doctor</option>
//             </select>
//           </div>

//           {/* Use SignUp component with unsafeMetadata */}
//           <SignUp
//             path="/signup"
//             routing="path"
//             unsafeMetadata={{ role }} // Save role
//           />
//         </SignedOut>

//         <SignedIn>
//           <div className="text-center">
//             <p>You are already signed in.</p>
//           </div>
//         </SignedIn>
//       </div>
//     </div>
//   );
// };

// export default SignUpPage;

////////////

// import React, { useState, useEffect } from "react";
// import { SignedIn, SignedOut, SignUp, useSignUp, useUser } from "@clerk/clerk-react";
// import { useNavigate } from "react-router-dom";

// const SignUpPage: React.FC = () => {

//   const navigate = useNavigate();
//   const { isLoaded, signUp } = useSignUp();
//   const { user, isSignedIn } = useUser();
//   const [role, setRole] = useState<string>(() => {
//     // Initialize from localStorage if available
//     return localStorage.getItem("selectedRole") || "pharmacist";
//   });

//   // Handle role selection
//   const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const selectedRole = e.target.value;
//     setRole(selectedRole);
//     localStorage.setItem("selectedRole", selectedRole);
//   };

//   // Handle redirection after signup
//   useEffect(() => {
//     if (!isSignedIn || !user) return;
    
//     // First try to get role from user metadata
//     let userRole = (user.unsafeMetadata?.role as string) || null;
    
//     // If not available in metadata, use the one from localStorage
//     if (!userRole) {
//       userRole = localStorage.getItem("selectedRole") || "patient";
      
//       // Optional: You could update the user metadata here if it's missing
//       // This ensures the role is stored permanently with the user
//       try {
//         user.update({
//           unsafeMetadata: {
//             ...user.unsafeMetadata,
//             role: userRole
//           }
//         });
//       } catch (error) {
//         console.error("Failed to update user metadata:", error);
//       }
//     }
    
//     // Store in localStorage for app-wide access
//     localStorage.setItem("userType", userRole);
//     localStorage.setItem("userId", user.id);
    
//     // Redirect based on role
//     switch (userRole) {
//       case "doctor":
//         navigate("/doctor-dashboard", { replace: true });
//         break;
//       case "pharmacist":
//         navigate("/pharmacist-dashboard", { replace: true });
//         break;
//       default:
//         navigate("/patient-dashboard", { replace: true });
//         break;
//     }
//   }, [isSignedIn, user, navigate]);

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-md">
//         <h2 className="text-2xl font-bold text-center mb-4">Sign Up</h2>
        
//         <SignedOut>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700">Select Your Role</label>
//             <select
//               value={role}
//               onChange={handleRoleChange}
//               className="w-full p-2 border rounded"
//             >
//               <option value="pharmacist">Pharmacist</option>
//               <option value="patient">Patient</option>
//               <option value="doctor">Doctor</option>
//             </select>
//           </div>
          
//           {/* Use SignUp component with unsafeMetadata */}
//           <SignUp
//             path="/signup"
//             routing="path"
//             unsafeMetadata={{ role }}
//           />
//         </SignedOut>
        
//         <SignedIn>
//           <div className="text-center">
//             <p>You are already signed in.</p>
//             <button 
//               onClick={() => {
//                 const userRole = user?.unsafeMetadata?.role as string || localStorage.getItem("selectedRole") || "patient";

//                 switch (userRole) {
//                   case "doctor":
//                     navigate("/doctor-dashboard");
//                     break;
//                   case "pharmacist":
//                     navigate("/pharmacist-dashboard");
//                     break;
//                   default:
//                     navigate("/patient-dashboard");
//                     break;
//                 }
//               }}
//               className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//             >
//               Go to Dashboard
//             </button>
//           </div>
//         </SignedIn>
//       </div>
//     </div>
//   );
// };

// export default SignUpPage;
///////

import React, { useState, useEffect } from "react";
import { SignedIn, SignedOut, SignUp, useSignUp, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoaded, signUp } = useSignUp();
  const { user, isSignedIn } = useUser();
  const [role, setRole] = useState<string>(() => {
    return localStorage.getItem("selectedRole") || "pharmacist"; // Default role: Pharmacist
  });

  const [isLoading, setIsLoading] = useState(true); // Prevent premature redirection

  // Handle role selection
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
    localStorage.setItem("selectedRole", selectedRole);
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

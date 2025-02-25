import { Navigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const dashboardPaths = {
  patient: '/patient-dashboard',
  doctor: '/doctor-dashboard',
  pharmacist: '/pharmacist-dashboard'
} as const;

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { role, isLoadingRole, isSignedIn } = useUserRole();

  // Show loading state while checking authentication
  if (isLoadingRole) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to sign in if not authenticated
  if (!isSignedIn) {
    return <Navigate to="/signin" replace />;
  }

  // If user is authenticated but has no role yet, wait for role to be set
  if (isSignedIn && !role) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to appropriate dashboard if user has wrong role
  if (role && !allowedRoles.includes(role)) {
    console.log('Redirecting to:', dashboardPaths[role]); // Debug log
    return <Navigate to={dashboardPaths[role]} replace />;
  }

  // If user is authenticated and has correct role, render the protected content
  return <>{children}</>;
}
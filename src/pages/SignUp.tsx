import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

const userRoles = [
  {
    id: 'patient',
    title: 'Patient',
    description: 'Access your medical records and book appointments',
    path: '/patient-dashboard'
  },
  {
    id: 'doctor',
    title: 'Doctor',
    description: 'Manage patient records and appointments',
    path: '/doctor-dashboard'
  },
  {
    id: 'pharmacist',
    title: 'Pharmacist',
    description: 'Process prescriptions and manage inventory',
    path: '/pharmacist-dashboard'
  }
] as const;

export default function SignUp() {
  const navigate = useNavigate();
  const { role, setUserRole, isLoadingRole } = useUserRole();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<typeof userRoles[number]['id']>('patient');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  // Monitor auth state and role changes
  useEffect(() => {
    if (!isLoadingRole && role) {
      const roleConfig = userRoles.find(r => r.id === role);
      if (roleConfig) {
        console.log('Navigating to:', roleConfig.path);
        navigate(roleConfig.path, { replace: true });
      }
    }
  }, [role, isLoadingRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create user account with Firebase
      const { user } = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      console.log('User created:', user.uid); // Debug log

      toast({
        title: 'Creating account...',
        description: 'Please wait while we set up your account.',
      });

      // Set user role with retry
      let roleSet = false;
      for (let i = 0; i < 3; i++) {
        try {
          roleSet = await setUserRole(selectedRole);
          if (roleSet) break;
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        } catch (error) {
          console.warn(`Attempt ${i + 1} failed:`, error);
        }
      }

      if (!roleSet) {
        throw new Error('Failed to set user role after multiple attempts');
      }

      console.log('Role set successfully:', selectedRole); // Debug log

      toast({
        title: 'Account created successfully!',
        description: `Welcome to MediFlow, ${formData.firstName}!`,
      });

      // Force navigation after a short delay
      setTimeout(() => {
        const roleConfig = userRoles.find(r => r.id === selectedRole);
        if (roleConfig) {
          console.log('Forcing navigation to:', roleConfig.path); // Debug log
          window.location.href = roleConfig.path;
        }
      }, 1500);
      
    } catch (error: any) {
      console.error('Error during sign up:', error);
      toast({
        title: 'Error creating account',
        description: error.message || 'An error occurred during sign up. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-lg mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Create your account</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Select your role</Label>
            <div className="grid gap-4">
              {userRoles.map((role) => (
                <div
                  key={role.id}
                  className={`p-4 border rounded-lg cursor-pointer ${
                    selectedRole === role.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <h3 className="font-medium">{role.title}</h3>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
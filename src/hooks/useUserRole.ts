import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { toast } from 'sonner';

export type UserRole = 'patient' | 'doctor' | 'pharmacist';

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole | undefined>();
  const [isLoadingRole, setIsLoadingRole] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setIsSignedIn(!!user);
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData?.role) {
              setRole(userData.role as UserRole);
            }
          }
        } catch (error: any) {
          console.error('Error fetching user role:', error);
          toast.error('Failed to fetch user role. Please try signing in again.');
        } finally {
          setIsLoadingRole(false);
        }
      } else {
        setRole(undefined);
        setIsLoadingRole(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const setUserRole = async (newRole: UserRole): Promise<boolean> => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error('No user is currently signed in.');
        return false;
      }

      // Ensure users collection exists
      const usersCollectionRef = collection(db, 'users');
      const userRef = doc(usersCollectionRef, user.uid);

      // Set the user data with role
      const userData = {
        role: newRole,
        email: user.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        uid: user.uid
      };

      await setDoc(userRef, userData);
      setRole(newRole);
      return true;
    } catch (error: any) {
      console.error('Error setting user role:', error);
      toast.error('Failed to set user role. Please try again.');
      return false;
    }
  };

  return {
    role,
    isLoadingRole,
    setUserRole,
    isSignedIn
  };
}; 
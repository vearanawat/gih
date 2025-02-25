import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Button } from '@/components/ui/button';
import {
  Sun,
  Moon,
  Bell,
  Menu,
} from 'lucide-react';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [darkMode, setDarkMode] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const location = useLocation();

  // Check if we're on a public page (landing, signin, signup)
  const isPublicPage = ['/', '/signin', '/signup'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              {!isPublicPage && (
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600">
                  <Menu className="w-6 h-6" />
                </button>
              )}
              <Link to="/" className="text-2xl font-bold text-green-600">
                MediFlow
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => setDarkMode(!darkMode)} className="text-gray-600">
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <SignedIn>
                <button className="relative text-gray-600">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    3
                  </span>
                </button>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>

              <SignedOut>
                {isPublicPage && (
                  <>
                    <Link to="/signin">
                      <Button variant="outline">Sign In</Button>
                    </Link>
                    <Link to="/signup">
                      <Button className="bg-green-600 hover:bg-green-700 text-white ml-2">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </SignedOut>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className={isPublicPage ? '' : 'pt-16'}>
        {children}
      </div>
    </div>
  );
};

export default MainLayout; 
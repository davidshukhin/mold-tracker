import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LogOut, Home } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export default function Layout() {
  const navigate = useNavigate();

  async function handleSignOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/auth');
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Link to="/" className="flex items-center">
              <Home className="h-6 w-6 text-indigo-600" />
              <span className="ml-2 text-lg font-semibold text-gray-900">Interior Tracker</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <LogOut className="h-5 w-5 mr-1" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>
      <main className="py-6">
        <Outlet />
      </main>
    </div>
  );
}
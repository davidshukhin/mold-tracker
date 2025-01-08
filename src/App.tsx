import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Auth from './components/Auth';
import Projects from './components/Projects';
import ProjectView from './components/ProjectView';
import ImageView from './components/ImageView';
import Layout from './components/Layout';
import { useAuth } from './hooks/useAuth';

function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/" />} />
        <Route element={<Layout />}>
          <Route path="/" element={session ? <Projects /> : <Navigate to="/auth" />} />
          <Route path="/project/:id" element={session ? <ProjectView /> : <Navigate to="/auth" />} />
          <Route path="/image/:id" element={session ? <ImageView /> : <Navigate to="/auth" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
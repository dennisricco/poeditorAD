'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import Button from '../components/Button';
import CartoonBackground from '../components/CartoonBackground';
import { Plus, Loader2, Database } from 'lucide-react';
import type { POEditorProject } from '../types';
import { withAuth } from '../lib/withAuth';
import Link from 'next/link';

// Fungsi untuk assign warna secara berurutan
const getColorForIndex = (index: number): 'yellow' | 'blue' | 'pink' | 'green' => {
  const colors: Array<'yellow' | 'blue' | 'pink' | 'green'> = ['yellow', 'blue', 'pink', 'green'];
  return colors[index % colors.length];
};

function DashboardPage() {
  const [projects, setProjects] = useState<POEditorProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/poeditor/projects');

        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }

        const data = await response.json();

        if (data.response?.status === 'success') {
          setProjects(data.result.projects);
        } else if (data.error) {
          setError(data.error);
        } else {
          setError(data.response?.message || 'Failed to fetch projects');
        }
      } catch (err) {
        setError('Failed to connect to POEditor API');
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <CartoonBackground />
        <Navbar />
        <main className="pt-32 pb-16 sm:pb-24">
          <div className="w-full max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-poe-blue border-4 border-poe-black rounded-3xl cartoon-shadow mx-auto flex items-center justify-center animate-bounce">
                  <Loader2 className="w-10 h-10 animate-spin" strokeWidth={3} />
                </div>
                <p className="text-xl font-black">Loading your projects...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <CartoonBackground />
        <Navbar />
        <main className="pt-32 pb-16 sm:pb-24">
          <div className="w-full max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="bg-poe-pink border-4 border-poe-black rounded-3xl cartoon-shadow p-8 max-w-md text-center">
                <h3 className="text-2xl font-black mb-3">Oops!</h3>
                <p className="text-lg font-bold mb-4">{error}</p>
                <Button variant="blue" size="md" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CartoonBackground />
      <Navbar />
      
      {/* Main Content */}
      <main className="pt-32 pb-16 sm:pb-24">
        <div className="w-full max-w-6xl mx-auto px-6">
          
          {/* Header Section */}
          <div className="space-y-8 mb-12">
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
                Your <span className="text-poe-blue">Projects</span>
              </h2>
              <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-700 max-w-2xl">
                Manage all your localization projects in one place
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button variant="green" size="lg">
                <Plus className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
                <span>New Project</span>
              </Button>
              
              <Link href="/database-connection">
                <Button variant="blue" size="lg">
                  <Database className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
                  <span>Database Connection</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.length === 0 ? (
              <div className="col-span-full">
                <div className="bg-poe-yellow border-4 border-poe-black rounded-3xl cartoon-shadow p-12 text-center">
                  <h3 className="text-3xl font-black mb-3">No Projects Yet!</h3>
                  <p className="text-lg font-bold mb-6">Create your first project to get started</p>
                  <Button variant="green" size="lg">
                    <Plus className="w-6 h-6" strokeWidth={3} />
                    <span>Create Project</span>
                  </Button>
                </div>
              </div>
            ) : (
              projects.map((project, index) => (
                <div key={project.id} className="m-2">
                  <ProjectCard
                    name={project.name}
                    projectId={project.id}
                    color={getColorForIndex(index)}
                    createdDate={project.created}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(DashboardPage);

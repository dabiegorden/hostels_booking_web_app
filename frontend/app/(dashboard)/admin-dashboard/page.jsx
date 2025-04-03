"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Fetch admin information
        const adminResponse = await fetch('http://localhost:5000/api/admin/info', {
          method: 'GET',
          credentials: 'include',
        });

        if (!adminResponse.ok) {
          // If not authenticated, redirect to login
          if (adminResponse.status === 401) {
            router.push('/admin');
            return;
          }
          throw new Error('Failed to fetch admin data');
        }

        const adminData = await adminResponse.json();
        setAdmin(adminData.admin);

        // Fetch student statistics
        const studentsResponse = await fetch('http://localhost:5000/api/admin/students', {
          method: 'GET',
          credentials: 'include',
        });

        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          setStats({
            totalStudents: studentsData.students.length
          });
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <p className="text-xl font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <p className="text-xl font-medium text-red-600">Error: {error}</p>
          <button 
            onClick={() => router.push('/admin')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <p className="text-xl font-medium">No admin data found</p>
          <button 
            onClick={() => router.push('/admin')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center">
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <span className="mr-3">{admin.name}</span>
                  <button 
                    onClick={async () => {
                      await fetch('http://localhost:5000/api/auth/logout', {
                        method: 'GET',
                        credentials: 'include'
                      });
                      router.push('/admin');
                    }}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Admin info card */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Admin Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="text-base">{admin.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-base">{admin.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Role</p>
              <p className="text-base">{admin.role}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Account Created</p>
              <p className="text-base">{new Date(admin.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">Total Students</h3>
            <p className="text-3xl font-bold">{stats.totalStudents}</p>
          </div>
          {/* Add more stat cards as needed */}
        </div>

        {/* Quick actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <button 
              onClick={() => router.push('/admin/students')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Manage Students
            </button>
            <button 
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              System Settings
            </button>
            {/* Add more action buttons as needed */}
          </div>
        </div>
      </div>
    </div>
  );
}








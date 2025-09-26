'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Shield,
  BarChart3,
  Settings,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  totalRevenue: number;
  totalTicketsSold: number;
  recentUsers: any[];
  recentEvents: any[];
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (user && user.role === 'admin') {
      fetchAdminData();
    }
  }, [user, loading, router]);

  const fetchAdminData = async () => {
    try {
      setLoadingData(true);
      
      // For now, we'll use mock data since admin endpoints aren't implemented yet
      // In a real implementation, you'd call admin-specific endpoints
      const mockStats: AdminStats = {
        totalUsers: 1250,
        totalEvents: 45,
        totalRevenue: 125000,
        totalTicketsSold: 3200,
        recentUsers: [
          { id: '1', name: 'John Doe', email: 'john@example.com', role: 'attendee', createdAt: '2024-01-15' },
          { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'organizer', createdAt: '2024-01-14' },
          { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'attendee', createdAt: '2024-01-13' },
        ],
        recentEvents: [
          { id: '1', title: 'Tech Conference 2024', organizer: 'Jane Smith', status: 'published', createdAt: '2024-01-15' },
          { id: '2', title: 'Music Festival', organizer: 'Mike Wilson', status: 'draft', createdAt: '2024-01-14' },
        ]
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoadingData(false);
    }
  };

  const createAdminUser = async () => {
    try {
      const response = await authApi.post('/users/create-admin', {
        name: 'Admin User',
        email: 'admin@ticketnow.com',
        password: 'admin123'
      });
      toast.success('Admin user created successfully!');
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('Admin user already exists');
      } else {
        toast.error('Failed to create admin user');
      }
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'events', name: 'Events', icon: Calendar },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Manage your platform and monitor system performance
              </p>
            </div>
            <div className="flex space-x-3">
              <Button onClick={createAdminUser} variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                Create Admin
              </Button>
              <Button onClick={fetchAdminData}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-50 text-primary-700 border border-primary-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Calendar className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Events</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <DollarSign className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Tickets Sold</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalTicketsSold.toLocaleString()}</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
                    <div className="space-y-3">
                      {stats.recentUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                          <Badge variant={user.role === 'admin' ? 'error' : user.role === 'organizer' ? 'success' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Events</h3>
                    <div className="space-y-3">
                      {stats.recentEvents.map((event) => (
                        <div key={event.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{event.title}</p>
                            <p className="text-sm text-gray-500">by {event.organizer}</p>
                          </div>
                          <Badge variant={event.status === 'published' ? 'success' : 'warning'}>
                            {event.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                    <Button size="sm">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add User
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-50 p-8 rounded-lg text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">User Management</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Full user management functionality will be implemented here.
                  </p>
                </div>
              </Card>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Event Management</h2>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                    <Button size="sm">
                      <Calendar className="mr-2 h-4 w-4" />
                      View All
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-50 p-8 rounded-lg text-center">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Event Management</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Full event management functionality will be implemented here.
                  </p>
                </div>
              </Card>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Analytics</h2>
                <div className="bg-gray-50 p-8 rounded-lg text-center">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Analytics Dashboard</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Advanced analytics and reporting will be implemented here.
                  </p>
                </div>
              </Card>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Settings</h2>
                <div className="bg-gray-50 p-8 rounded-lg text-center">
                  <Settings className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Platform Configuration</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Platform-wide settings and configuration will be implemented here.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

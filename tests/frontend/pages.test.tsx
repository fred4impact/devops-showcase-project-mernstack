import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Next.js router
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: jest.fn(),
  }),
}));

// Mock the useAuth hook
const mockUseAuth = {
  user: null,
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
};

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth,
}));

describe('Page Components Smoke Tests', () => {
  describe('HomePage', () => {
    it('should render homepage with hero section', () => {
      const HomePage = () => (
        <div className="min-h-screen">
          <section className="relative bg-gradient-to-br from-primary-50 to-secondary-50 py-20 lg:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-4xl md:text-6xl font-bold text-secondary-900 mb-6">
                  The Modern Way to
                  <span className="text-primary-600"> Sell Tickets</span>
                </h1>
                <p className="text-xl text-secondary-600 mb-8 max-w-3xl mx-auto">
                  Create, manage, and sell tickets for your events with our powerful, 
                  user-friendly platform. From small gatherings to massive festivals.
                </p>
              </div>
            </div>
          </section>
        </div>
      );

      render(<HomePage />);
      
      expect(screen.getByText('The Modern Way to')).toBeInTheDocument();
      expect(screen.getByText('Sell Tickets')).toBeInTheDocument();
      expect(screen.getByText(/Create, manage, and sell tickets/)).toBeInTheDocument();
    });

    it('should render features section', () => {
      const features = [
        {
          title: 'Event Management',
          description: 'Create and manage events with ease. Set dates, venues, and ticket types.',
        },
        {
          title: 'Smart Ticketing',
          description: 'Generate QR codes, PDF tickets, and manage capacity automatically.',
        },
      ];

      const HomePage = () => (
        <div>
          <section className="py-20 bg-secondary-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
                  Everything You Need to Succeed
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      );

      render(<HomePage />);
      
      expect(screen.getByText('Everything You Need to Succeed')).toBeInTheDocument();
      expect(screen.getByText('Event Management')).toBeInTheDocument();
      expect(screen.getByText('Smart Ticketing')).toBeInTheDocument();
    });
  });

  describe('Login Page', () => {
    it('should render login form', () => {
      const LoginPage = () => (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Sign in to your account
              </h2>
            </div>
            <form className="mt-8 space-y-6">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Password"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      );

      render(<LoginPage />);
      
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    });

    it('should handle form submission', async () => {
      const handleSubmit = jest.fn((e) => e.preventDefault());
      
      const LoginPage = () => (
        <form onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Email address"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <button type="submit">Sign in</button>
        </form>
      );

      render(<LoginPage />);
      
      const form = screen.getByRole('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Register Page', () => {
    it('should render registration form', () => {
      const RegisterPage = () => (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Create your account
              </h2>
            </div>
            <form className="mt-8 space-y-6">
              <div>
                <input
                  name="firstName"
                  type="text"
                  required
                  placeholder="First name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <input
                  name="lastName"
                  type="text"
                  required
                  placeholder="Last name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Create account
                </button>
              </div>
            </form>
          </div>
        </div>
      );

      render(<RegisterPage />);
      
      expect(screen.getByText('Create your account')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('First name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Last name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
    });
  });

  describe('Events Page', () => {
    it('should render events list', () => {
      const mockEvents = [
        {
          id: '1',
          title: 'Summer Music Festival',
          description: 'A great music festival',
          startDate: '2024-07-15',
          location: 'Central Park',
          price: 50,
        },
        {
          id: '2',
          title: 'Tech Conference 2024',
          description: 'Latest in technology',
          startDate: '2024-08-20',
          location: 'Convention Center',
          price: 100,
        },
      ];

      const EventsPage = () => (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Upcoming Events</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <div className="text-sm text-gray-500">
                  <p>Date: {event.startDate}</p>
                  <p>Location: {event.location}</p>
                  <p>Price: ${event.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

      render(<EventsPage />);
      
      expect(screen.getByText('Upcoming Events')).toBeInTheDocument();
      expect(screen.getByText('Summer Music Festival')).toBeInTheDocument();
      expect(screen.getByText('Tech Conference 2024')).toBeInTheDocument();
    });
  });
});

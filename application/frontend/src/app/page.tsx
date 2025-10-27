'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import {
  Calendar,
  Ticket,
  Users,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  Star,
  CheckCircle,
  Plus,
  BarChart3,
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const features = [
    {
      icon: Calendar,
      title: 'Event Management',
      description:
        'Create and manage events with ease. Set dates, venues, and ticket types.',
    },
    {
      icon: Ticket,
      title: 'Smart Ticketing',
      description:
        'Generate QR codes, PDF tickets, and manage capacity automatically.',
    },
    {
      icon: Users,
      title: 'Audience Insights',
      description:
        'Track sales, analyze data, and understand your audience better.',
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description:
        'Stripe integration ensures secure and reliable payment processing.',
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description:
        'Live seat selection, instant confirmations, and real-time notifications.',
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description:
        'Sell tickets worldwide with multi-currency and timezone support.',
    },
  ];

  const stats = [
    { label: 'Events Created', value: '10,000+' },
    { label: 'Tickets Sold', value: '1M+' },
    { label: 'Happy Organizers', value: '5,000+' },
    { label: 'Countries', value: '50+' },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Event Organizer',
      content:
        'TicketNow has revolutionized how we manage our events. The interface is intuitive and the features are exactly what we needed.',
      rating: 5,
    },
    {
      name: 'Mike Chen',
      role: 'Concert Promoter',
      content:
        'The real-time seat selection and payment processing is flawless. Our customers love the experience.',
      rating: 5,
    },
    {
      name: 'Emily Davis',
      role: 'Conference Director',
      content:
        'From small workshops to large conferences, TicketNow scales perfectly. Highly recommended!',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-secondary-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-secondary-900 mb-6">
              The Modern Way to
              <span className="text-primary-600"> Sell Tickets</span>
            </h1>
            <p className="text-xl text-secondary-600 mb-8 max-w-3xl mx-auto">
              Create, manage, and sell tickets for your events with our
              powerful, user-friendly platform. From small gatherings to massive
              festivals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user?.role === 'organizer' ? (
                <>
                  <Button
                    size="lg"
                    className="text-lg px-8 py-4"
                    onClick={() => router.push('/events/create')}
                  >
                    Create New Event
                    <Plus className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-lg px-8 py-4"
                    onClick={() => router.push('/organizer/events')}
                  >
                    Manage Events
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="text-lg px-8 py-4"
                    onClick={() => router.push('/events/create')}
                  >
                    Start Creating Events
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-lg px-8 py-4"
                    onClick={() => router.push('/events')}
                  >
                    Browse Events
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-secondary-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Organizer Quick Actions */}
      {user?.role === 'organizer' && (
        <section className="py-16 bg-primary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Organizer Dashboard
              </h2>
              <p className="text-lg text-gray-600">
                Quick access to your event management tools
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push('/events/create')}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                    <Plus className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Create Event
                    </h3>
                    <p className="text-sm text-gray-600">Start a new event</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  Set up your event details, venue, and ticket types in minutes.
                </p>
              </Card>

              <Card
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push('/organizer/events')}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">My Events</h3>
                    <p className="text-sm text-gray-600">Manage your events</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  View, edit, and manage all your events from one place.
                </p>
              </Card>

              <Card
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push('/organizer/analytics')}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Analytics</h3>
                    <p className="text-sm text-gray-600">Track performance</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  Get insights into your event performance and sales data.
                </p>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Powerful features designed to make event management simple and
              ticket sales effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow duration-300"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Loved by Event Organizers
            </h2>
            <p className="text-xl text-secondary-600">
              See what our customers have to say about TicketNow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow duration-300"
              >
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-warning-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-secondary-600 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold text-secondary-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-secondary-500">
                      {testimonial.role}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of event organizers who trust TicketNow to power
            their events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
              Create Your First Event
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary-600"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

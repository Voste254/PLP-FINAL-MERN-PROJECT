import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Users, Clock, Shield } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Calendar className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Health Appointment Scheduler
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with healthcare professionals easily. Book appointments, manage your health records, and get the care you need.
          </p>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          )}

          {user && (
            <div className="space-y-4">
              <p className="text-lg">Welcome back, {user.name}!</p>
              <Link to={user.role === 'patient' ? '/patient' : '/doctor'}>
                <Button size="lg">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-4" />
              <CardTitle>For Patients</CardTitle>
              <CardDescription>
                Easy appointment booking and health record management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Book appointments with specialists</li>
                <li>• View appointment history</li>
                <li>• Manage your health records</li>
                <li>• Get appointment confirmations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-4" />
              <CardTitle>For Doctors</CardTitle>
              <CardDescription>
                Streamlined patient management and scheduling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Manage appointment requests</li>
                <li>• Approve or decline bookings</li>
                <li>• View patient information</li>
                <li>• Organize your schedule</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="h-8 w-8 text-primary mb-4" />
              <CardTitle>Secure & Reliable</CardTitle>
              <CardDescription>
                Your health data is protected and always available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• HIPAA compliant security</li>
                <li>• 24/7 system availability</li>
                <li>• Encrypted data storage</li>
                <li>• Real-time notifications</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;

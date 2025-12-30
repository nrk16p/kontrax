import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { CheckCircle2, FileSignature, Shield, Zap } from 'lucide-react';
export function HomePage() {
  return <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 md:px-6 lg:py-32 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6">
            Rental Agreements Made <span className="text-blue-600">Simple</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            Create, manage, and sign rental contracts securely online.
            Streamline your property management workflow with our digital
            contract platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto text-lg h-12 px-8">
                Start for Free
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg h-12 px-8">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-slate-600">
              Complete toolkit for modern property managers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg bg-slate-50/50">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                  <FileSignature className="h-6 w-6" />
                </div>
                <CardTitle>Digital Signatures</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Legally binding e-signatures for landlords and tenants. Sign
                  from any device, anywhere in the world.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-slate-50/50">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600 mb-4">
                  <Zap className="h-6 w-6" />
                </div>
                <CardTitle>Instant Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Use our pre-vetted rental agreement templates or create your
                  own custom templates for reuse.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-slate-50/50">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
                  <Shield className="h-6 w-6" />
                </div>
                <CardTitle>Secure Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  All your contracts are encrypted and stored securely in the
                  cloud. Access them whenever you need.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10k+</div>
              <div className="text-slate-400">Contracts Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-slate-400">Uptime Guarantee</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-slate-400">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="container mx-auto max-w-4xl text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to streamline your rentals?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of property managers who trust ContractFlow for their
            agreements.
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="text-blue-600 h-14 px-10 text-lg">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>;
}
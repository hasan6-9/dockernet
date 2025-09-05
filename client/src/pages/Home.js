import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Dr. Sarah Chen",
      role: "Senior Cardiologist",
      content:
        "Dockernet has transformed how I manage my practice. The enhanced profiles and advanced search make finding qualified junior doctors effortless.",
      avatar: "SC",
    },
    {
      name: "Dr. Michael Rodriguez",
      role: "Junior Emergency Medicine",
      content:
        "The platform helped me showcase my portfolio and connect with amazing mentors, advancing my career in ways I never imagined.",
      avatar: "MR",
    },
    {
      name: "Dr. Emily Thompson",
      role: "Senior Neurologist",
      content:
        "The verification process and professional profiles ensure exceptional quality. Highly recommended for serious medical collaborations.",
      avatar: "ET",
    },
  ];

  const features = [
    {
      icon: "🏥",
      title: "Verified Medical Professionals",
      description:
        "Every doctor is thoroughly verified with medical licenses and credentials through automated and admin workflows",
    },
    {
      icon: "📊",
      title: "Enhanced Professional Profiles",
      description:
        "Showcase your portfolio, experience, skills, ratings, and verified documents",
    },
    {
      icon: "🔍",
      title: "Advanced Doctor Search",
      description:
        "Multi-filter search by specialty, experience, rating, location, and more",
    },
    {
      icon: "🤝",
      title: "Seamless Collaboration",
      description:
        "Built-in tools for project management, secure communication, and real-time messaging",
    },
    {
      icon: "💼",
      title: "Flexible Opportunities",
      description:
        "Part-time, full-time, and project-based remote medical opportunities",
    },
    {
      icon: "🔒",
      title: "HIPAA Compliant",
      description:
        "Enterprise-grade security for all medical communications and data",
    },
  ];

  const statistics = [
    {
      value: "1,000+",
      label: "Verified Doctors",
    },
    {
      value: "500+",
      label: "Successful Collaborations",
    },
    {
      value: "4.8/5",
      label: "Average Rating",
    },
    {
      value: "95%",
      label: "Satisfaction Rate",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-trust-50 via-white to-medical-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-medical rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="text-2xl font-bold text-gradient-medical">
                Dockernet
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-trust-600 hover:text-medical-600 font-medium transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-trust-600 hover:text-medical-600 font-medium transition-colors"
              >
                How It Works
              </a>
              <a
                href="#testimonials"
                className="text-trust-600 hover:text-medical-600 font-medium transition-colors"
              >
                Testimonials
              </a>
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-medical">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost-enhanced">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-medical">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 pattern-medical opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-trust-900 mb-6 animate-fade-in-up">
              Upwork for Doctors:
              <span className="block text-gradient-medical">
                Connect, Collaborate, Advance
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-trust-600 mb-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              The premier marketplace where senior doctors delegate tasks to
              talented junior doctors for remote opportunities. Seniors scale
              their practices, juniors gain experience and income.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in-up animation-delay-400">
              {!isAuthenticated && (
                <>
                  <Link
                    to="/register?role=senior"
                    className="btn-medical text-lg px-8 py-4"
                  >
                    I'm a Senior Doctor
                  </Link>
                  <Link
                    to="/register?role=junior"
                    className="btn-primary-enhanced text-lg px-8 py-4"
                  >
                    I'm a Junior Doctor
                  </Link>
                </>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-trust-500 animate-fade-in-up animation-delay-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-medical-400 rounded-full animate-pulse-soft"></div>
                <span className="text-sm font-medium">HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-medical-400 rounded-full animate-pulse-soft animation-delay-200"></div>
                <span className="text-sm font-medium">
                  100% Verified Professionals
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-medical-400 rounded-full animate-pulse-soft animation-delay-400"></div>
                <span className="text-sm font-medium">
                  Secure & Confidential
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements for Modern Design */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-medical rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-primary rounded-full opacity-30 animate-float animation-delay-300"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-gradient-accent rounded-full opacity-25 animate-float animation-delay-600"></div>
      </section>

      {/* Role-Based Value Propositions */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-trust-900 mb-4">
              Built for Medical Professionals
            </h2>
            <p className="text-xl text-trust-600 max-w-2xl mx-auto">
              Whether you're a senior doctor looking to delegate or a junior
              seeking opportunities, our enhanced platform has you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Senior Doctors */}
            <div className="card-medical animate-fade-in-up">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👨‍⚕️</span>
                </div>
                <h3 className="text-2xl font-bold text-trust-900 mb-2">
                  For Senior Doctors
                </h3>
                <p className="text-trust-600">
                  Scale your practice with verified junior talent
                </p>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-medical-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-medical-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-trust-700">
                    Advanced search for pre-vetted juniors
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-medical-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-medical-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-trust-700">
                    Delegate tasks via detailed job postings
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-medical-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-medical-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-trust-700">Focus on complex cases</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-medical-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-medical-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-trust-700">
                    Secure, HIPAA-compliant tools
                  </span>
                </li>
              </ul>

              {!isAuthenticated && (
                <Link
                  to="/register?role=senior"
                  className="w-full btn-primary-enhanced flex justify-center"
                >
                  Start Hiring
                </Link>
              )}
            </div>

            {/* Junior Doctors */}
            <div className="card-medical animate-fade-in-up animation-delay-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-medical rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👩‍⚕️</span>
                </div>
                <h3 className="text-2xl font-bold text-trust-900 mb-2">
                  For Junior Doctors
                </h3>
                <p className="text-trust-600">
                  Build your career with remote mentorship opportunities
                </p>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-medical-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-medical-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-trust-700">
                    Showcase your enhanced profile and portfolio
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-medical-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-medical-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-trust-700">
                    Search flexible remote opportunities
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-medical-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-medical-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-trust-700">
                    Earn competitive compensation
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-medical-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-medical-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-trust-700">
                    Build ratings and network
                  </span>
                </li>
              </ul>

              {!isAuthenticated && (
                <Link
                  to="/register?role=junior"
                  className="w-full btn-medical flex justify-center"
                >
                  Find Opportunities
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-20 bg-gradient-to-br from-trust-50 to-medical-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-trust-900 mb-4">
              How Dockernet Works
            </h2>
            <p className="text-xl text-trust-600 max-w-2xl mx-auto">
              Simple steps to start collaborating on our secure platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="card-trust">
              <h3 className="text-2xl font-bold text-trust-900 mb-6 text-center">
                For Senior Doctors
              </h3>
              <ol className="space-y-4 list-decimal list-inside text-trust-700">
                <li>Sign up and get verified with your credentials</li>
                <li>Post detailed job opportunities</li>
                <li>Use advanced search to find matching junior doctors</li>
                <li>Hire, collaborate securely, and rate the experience</li>
              </ol>
            </div>
            <div className="card-trust">
              <h3 className="text-2xl font-bold text-trust-900 mb-6 text-center">
                For Junior Doctors
              </h3>
              <ol className="space-y-4 list-decimal list-inside text-trust-700">
                <li>Sign up and build your enhanced professional profile</li>
                <li>Upload documents for verification</li>
                <li>Search and apply to opportunities with your portfolio</li>
                <li>
                  Complete projects, earn ratings, and advance your career
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-trust-900 mb-4">
              Why Choose Dockernet?
            </h2>
            <p className="text-xl text-trust-600 max-w-2xl mx-auto">
              The enhanced platform built for secure medical freelancing and
              collaboration
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card-trust text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-trust-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-trust-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gradient-to-br from-trust-50 to-medical-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-trust-900 mb-4">
              Our Impact in Numbers
            </h2>
            <p className="text-xl text-trust-600 max-w-2xl mx-auto">
              Join a growing community of medical professionals achieving
              success
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {statistics.map((stat, index) => (
              <div
                key={index}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-5xl font-bold text-medical-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-trust-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-trust-900 mb-4">
              Trusted by Medical Professionals
            </h2>
            <p className="text-xl text-trust-600">
              Hear from doctors transforming their practices and careers
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="card-glass text-center p-8 md:p-12">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-medical rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                  {testimonials[currentTestimonial].avatar}
                </div>
                <blockquote className="text-xl md:text-2xl text-trust-700 italic mb-4">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                <div className="text-trust-900 font-semibold">
                  {testimonials[currentTestimonial].name}
                </div>
                <div className="text-trust-500 text-sm">
                  {testimonials[currentTestimonial].role}
                </div>
              </div>
            </div>

            {/* Testimonial Navigation */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial
                      ? "bg-medical-500 scale-125"
                      : "bg-trust-300 hover:bg-trust-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-medical-600 via-primary-600 to-accent-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your
            <span className="block">Medical Career?</span>
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of verified medical professionals building successful
            remote collaborations.
          </p>

          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="bg-white text-medical-600 hover:bg-trust-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white hover:bg-white hover:text-medical-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Animated Background Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-white/10 rounded-full animate-float animation-delay-300"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-float animation-delay-600"></div>
      </section>

      {/* Footer */}
      <footer className="bg-trust-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-medical rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">D</span>
                </div>
                <span className="text-xl font-bold">Dockernet</span>
              </div>
              <p className="text-trust-300 mb-4 max-w-md">
                The premier marketplace connecting senior doctors with talented
                junior doctors for remote medical opportunities.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-trust-800 rounded-lg flex items-center justify-center hover:bg-trust-700 transition-colors cursor-pointer">
                  <span className="text-sm">📧</span>
                </div>
                <div className="w-8 h-8 bg-trust-800 rounded-lg flex items-center justify-center hover:bg-trust-700 transition-colors cursor-pointer">
                  <span className="text-sm">💼</span>
                </div>
                <div className="w-8 h-8 bg-trust-800 rounded-lg flex items-center justify-center hover:bg-trust-700 transition-colors cursor-pointer">
                  <span className="text-sm">🐦</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-trust-300">
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-trust-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-trust-800 mt-8 pt-8 text-center text-trust-400">
            <p>
              &copy; 2025 Dockernet. All rights reserved. HIPAA Compliant
              Medical Platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

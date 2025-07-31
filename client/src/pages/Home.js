import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Docker<span className="text-blue-600">net</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl">
            The premier marketplace connecting senior doctors with talented
            junior doctors for remote medical opportunities.
          </p>

          <div className="space-x-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                For Senior Doctors
              </h3>
              <p className="text-gray-600">
                Delegate tasks, find specialized expertise, and expand your
                practice with qualified junior doctors.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                For Junior Doctors
              </h3>
              <p className="text-gray-600">
                Gain experience, earn additional income, and build professional
                relationships with established practitioners.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

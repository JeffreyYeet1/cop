// app/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Brain, ArrowRight, Clock, Users, CheckCircle } from 'lucide-react';
import NavBar from './components/navbar';
import AnimatedBackground from './components/FloatingPaths';
import { motion } from "framer-motion";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { 
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1]
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-50/80 via-white/80 to-violet-100/80 animate-gradient z-0">
        <div className="absolute inset-0 bg-[length:400%_400%] bg-gradient-to-r from-violet-100/30 via-fuchsia-100/30 to-violet-100/30 animate-gradient-background"></div>
        <div className="absolute inset-0 bg-[length:200%_200%] bg-gradient-to-br from-white/0 via-violet-100/30 to-white/30 animate-gradient-slow"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/50 to-white/80"></div>
      </div>
      
      <nav className="w-full relative z-10">
        <NavBar />
      </nav>
      
      {/* Hero Section */}
      <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 relative z-10">
        <motion.div 
          className="max-w-4xl w-full text-center space-y-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          <div className="space-y-8">
            <div className="space-y-4">
              <motion.h1 
                className="text-7xl font-bold text-gray-900 tracking-tight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ 
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                <motion.span 
                  className="inline-block hover:text-violet-600 transition-all duration-300 cursor-default group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ 
                    scale: 1.05,
                    transition: { type: "spring", stiffness: 300, damping: 10 }
                  }}
                  transition={{ 
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                >
                  Clash Of
                </motion.span>{' '}
                <motion.span
                  className="inline-block hover:text-violet-600 transition-all duration-300 cursor-default"
                  initial={{ opacity: 0, y: -40, rotate: -5, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                  whileHover={{ 
                    scale: 1.1,
                    y: -5,
                    rotate: -2,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                  transition={{ 
                    duration: 1,
                    delay: 0.2,
                    type: "spring",
                    stiffness: 100,
                    damping: 20
                  }}
                >
                  Plans
                </motion.span>
              </motion.h1>
              <motion.h2 
                className="text-4xl font-semibold text-violet-600 tracking-tight hover:text-violet-700 transition-all duration-300 cursor-default"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  scale: 1.02,
                  y: -2,
                  transition: { type: "spring", stiffness: 300, damping: 10 }
                }}
                transition={{ 
                  duration: 0.7,
                  delay: 0.3,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                Designed for the way you work
              </motion.h2>
            </div>
            <motion.p 
              className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed hover:text-gray-900 transition-all duration-300 cursor-default"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ 
                scale: 1.01,
                y: -1,
                transition: { type: "spring", stiffness: 200, damping: 10 }
              }}
              transition={{ 
                duration: 0.7,
                delay: 0.4,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              Your intelligent productivity companion that uses AI to optimize your schedule, 
              resolve conflicts between tasks, and help you achieve more with less stress.
            </motion.p>
          </div>
          
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.7,
              delay: 0.5,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            <Link 
              href={isLoggedIn ? "/dashboard" : "/signup"} 
              className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-medium py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1"
            >
              <Calendar size={20} />
              <span>{isLoggedIn ? "Go to Dashboard" : "Get Started"}</span>
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <div className="relative z-10 space-y-0">
        {/* Features and Statistics Section */}
        <div className="w-full py-20 relative z-10">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
              {/* Key Features */}
              <motion.div 
                className="space-y-12"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                <motion.h2 
                  className="text-4xl font-bold text-gray-900 text-center hover:text-violet-600 transition-colors duration-300"
                  {...fadeInUp}
                >
                  Key Features
                </motion.h2>
                <div className="space-y-16">
                  <motion.div 
                    className="space-y-4 text-center group hover:-translate-y-2 transition-transform duration-300 ease-out cursor-default"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.7,
                      delay: 0.2,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                  >
                    <div className="flex justify-center mb-6">
                      <div className="p-4 bg-violet-100/50 rounded-2xl group-hover:bg-violet-200/70 group-hover:scale-110 transition-all duration-300">
                        <Brain className="w-12 h-12 text-violet-600 group-hover:text-violet-700" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 group-hover:text-violet-600 transition-colors duration-300">
                      AI-Powered Scheduling
                    </h3>
                    <p className="text-lg text-gray-600 group-hover:text-gray-900 transition-colors duration-300">
                      Smart algorithms help you prioritize and schedule your tasks efficiently
                    </p>
                  </motion.div>

                  <motion.div 
                    className="space-y-4 text-center group hover:-translate-y-2 transition-transform duration-300 ease-out cursor-default"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.7,
                      delay: 0.3,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                  >
                    <div className="flex justify-center mb-6">
                      <div className="p-4 bg-violet-100/50 rounded-2xl group-hover:bg-violet-200/70 group-hover:scale-110 transition-all duration-300">
                        <Clock className="w-12 h-12 text-violet-600 group-hover:text-violet-700" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 group-hover:text-violet-600 transition-colors duration-300">
                      Focus Mode
                    </h3>
                    <p className="text-lg text-gray-600 group-hover:text-gray-900 transition-colors duration-300">
                      Hyperfocus on your most important task without distractions
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Key Statistics */}
              <motion.div 
                className="space-y-12"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                <motion.h2 
                  className="text-4xl font-bold text-gray-900 text-center hover:text-violet-600 transition-colors duration-300"
                  {...fadeInUp}
                >
                  Why Students Need Clash of Plans
                </motion.h2>
                <div className="space-y-16">
                  <motion.div 
                    className="space-y-4 text-center group hover:-translate-y-2 transition-transform duration-300 ease-out cursor-default"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.7,
                      delay: 0.2,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                  >
                    <div className="flex justify-center mb-6">
                      <div className="p-4 bg-violet-100/50 rounded-2xl group-hover:bg-violet-200/70 group-hover:scale-110 transition-all duration-300">
                        <Users className="w-12 h-12 text-violet-600 group-hover:text-violet-700" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 group-hover:text-violet-600 transition-colors duration-300">
                      87% of Students
                    </h3>
                    <p className="text-lg text-gray-600 group-hover:text-gray-900 transition-colors duration-300">
                      struggle with time management and scheduling conflicts
                    </p>
                  </motion.div>

                  <motion.div 
                    className="space-y-4 text-center group hover:-translate-y-2 transition-transform duration-300 ease-out cursor-default"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.7,
                      delay: 0.3,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                  >
                    <div className="flex justify-center mb-6">
                      <div className="p-4 bg-violet-100/50 rounded-2xl group-hover:bg-violet-200/70 group-hover:scale-110 transition-all duration-300">
                        <CheckCircle className="w-12 h-12 text-violet-600 group-hover:text-violet-700" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 group-hover:text-violet-600 transition-colors duration-300">
                      3.5x More Productive
                    </h3>
                    <p className="text-lg text-gray-600 group-hover:text-gray-900 transition-colors duration-300">
                      when using AI-powered scheduling tools
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="w-full py-6 text-center text-gray-500 relative z-10">
        <p>© {new Date().getFullYear()} Clash of Plans. All rights reserved.</p>
      </footer>
    </div>
  );
}
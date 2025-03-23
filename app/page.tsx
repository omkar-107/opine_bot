"use client";

import Image from 'next/image';
import React, { useState } from "react";
import MobileAuthMenu from '../components/ui/MobileAuthMenu';
import { LampDemo } from "../components/ui/lamp";
import { HoverEffect } from "../components/ui/card_hover_effect";
import { BackgroundBeamsWithCollision } from "../components/ui/background_beams_with_collision";
import { Menu, MenuItem } from "../components/ui/navbar_mwnu.js";
// import {Navbar} from '../components/ui/navbar.js';
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import CustomNavbar from "../components/ui/navbar"; // Adjust the path
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageCircle,
  BarChart2,
  Users,
  Zap,
  ArrowRight,
  CheckCircle,
  Play,
  Shield,
  Clock,
  Settings,
  MessageSquare,
  LineChart,
  Lightbulb,
  RefreshCw,
  LogIn,
  UserPlus
} from "lucide-react";

import logo from '../public/assets/rb_411.png';
import { Navbar, Typography, Button } from "@material-tailwind/react";

const navList = (
  <ul className="mt-20 mb-4 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">

  </ul>
);

const benefits = [
  {
    icon: <Lightbulb />,
    title: "Smarter Insights",
    description: "AI-powered analysis provides deeper understanding of student feedback",
    gradient: "from-blue-500 to-cyan-400"
  },
  {
    icon: <MessageCircle />,
    title: "Higher Engagement",
    description: "Interactive format leads to higher participation",
    gradient: "from-purple-500 to-pink-400"
  },
  {
    icon: <Clock />,
    title: "Time Savings",
    description: "Automated analysis saves 10+ hours per course",
    gradient: "from-green-500 to-emerald-400"
  }
];

const projects = [
  {
    description: "An interactive feedback system that enables real-time, adaptive conversations with students, such as questions based on individual responses, fostering a more personalized experience",
  },
  {
    description: "An automated feedback system based on a particular course syllabus",
  },
  {
    description: "Insights for making student feedback more productive in terms of revising syllabus, teaching styles, redesign of curriculum, or changing the way courses are taught",
  },
];

const howItWorks = [
  {
    step: 1,
    title: "Share Your Thoughts",
    description: "Start a conversation with our AI-powered feedback system that adapts to your responses",
    icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
    color: "blue"
  },
  {
    step: 2,
    title: "Analysis & Processing",
    description: "Our system analyzes your feedback using advanced natural language processing",
    icon: <LineChart className="w-6 h-6 text-green-600" />,
    color: "green"
  },
  {
    step: 3,
    title: "Generate Insights",
    description: "Transform raw feedback into actionable insights and recommendations",
    icon: <Lightbulb className="w-6 h-6 text-yellow-600" />,
    color: "yellow"
  },
  {
    step: 4,
    title: "Continuous Improvement",
    description: "Implement changes based on feedback and monitor progress over time",
    icon: <RefreshCw className="w-6 h-6 text-purple-600" />,
    color: "purple"
  }
];

export default function LandingPage() {
  const [active, setActive] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full overflow-x-hidden">

      {/* Responsive Navbar */}
  <Navbar className="sticky top-0 z-10 h-max w-full max-w-full rounded-none px-4 py-2 lg:px-8 shadow-md">
        <div className="flex items-center justify-between text-blue-gray-900">
          <Typography as="a" href="#" className="mx-2 sm:mx-5 pl-2 sm:pl-5 text-xl sm:text-3xl cursor-pointer py-1.5 text-black font-semibold">
            OpineBot
          </Typography>

          {/* Desktop Auth Buttons */}
       
          <div className="hidden md:flex items-center space-x-4 ml-auto">
            <a href="/login" className="flex items-center px-4 py-2 text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50 transition-colors duration-300">
              <LogIn className="w-4 h-4 mr-2" />
              <span>Log In</span>
            </a>
            <a href="/signup" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300 shadow-md hover:shadow-lg">
              <UserPlus className="w-4 h-4 mr-2" />
              <span>Sign Up</span>
            </a>
          </div>

          {/* Mobile Auth Menu */}
          <MobileAuthMenu />
        </div>
      </Navbar>

        {/* Hero Section - Responsive */}
        <section className="flex flex-col md:flex-row justify-between w-full px-4 sm:px-6 md:px-10 lg:px-16 py-8 md:py-12 bg-violet-200">
          <div className='flex flex-col justify-center md:mx-0 lg:mx-8 max-w-xl'>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
              Smart Feedback for
              <span className="text-blue-600 block">Modern Education</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 md:mb-8">
              Transform your course feedback with AI-powered conversations that engage students and provide deeper insights.
            </p>

            {/* Hero CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <a href="/signup" className="flex items-center justify-center bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md text-base sm:text-lg font-medium">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
              <a href="#how-it-works" className="flex items-center justify-center bg-white text-blue-600 py-3 px-6 rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors duration-300 text-base sm:text-lg font-medium">
                Learn More
              </a>
            </div>
          </div>
          <div className="mt-6 md:mt-0 flex justify-center md:justify-end">
            <Image
              src={logo}
              alt="Logo"
              className="w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl h-auto"
              priority
            />
          </div>
        </section>

        {/* What to Expect Section - Responsive */}
        <section className="py-10 md:py-16 bg-gradient-to-b from-gray-50 to-white w-full">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-black text-center mb-10 md:mb-16 text-gray-900 transition-all duration-300 hover:text-purple-600">
              What to Expect
            </h2>

            <Tabs defaultValue="students" className="max-w-4xl mx-auto">
              <TabsList className="grid grid-cols-2 mb-6 md:mb-8 w-full bg-gray-100 h-auto p-1 rounded-lg">
                {["students", "educators"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="text-sm sm:text-base md:text-xl font-semibold capitalize px-2 sm:px-4 md:px-8 py-2 md:py-4 rounded-md transition-all duration-300
                    data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-md
                    data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-purple-500
                    data-[state=inactive]:hover:bg-gray-50"
                  >
                    For {tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              {[
                {
                  value: "students",
                  title: "Student Experience",
                  features: [
                    "Interactive chat-like interface instead of boring forms",
                    "Personalized questions based on your responses",
                    "Quick 5-minute feedback sessions",
                    "Voice your concerns naturally and effectively"
                  ]
                },
                {
                  value: "educators",
                  title: "Educator Dashboard",
                  features: [
                    "Real-time feedback analysis and insights",
                    "Trend identification and recommendation engine",
                    "Automated response categorization and sentiment analysis",
                    "Custom report generation and sharing"
                  ]
                }
              ].map((content) => (
                <TabsContent
                  key={content.value}
                  value={content.value}
                  className="focus-visible:outline-none focus-visible:ring-0"
                >
                  <Card className="px-4 sm:px-6 md:px-8 py-4 md:py-6 w-full bg-white shadow-lg rounded-xl
                  transform transition-all duration-500 hover:scale-102 hover:shadow-xl
                  border-2 border-transparent hover:border-purple-100">
                    <CardContent className="p-4 md:p-8">
                      <h3 className="text-xl md:text-2xl font-semibold mb-4 md:mb-8 text-gray-800 border-b pb-4">
                        {content.title}
                      </h3>
                      <div className="grid gap-4 md:gap-6">
                        {content.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3 md:space-x-4 p-2 md:p-3 rounded-lg
                            transition-all duration-300 hover:bg-purple-50 group"
                          >
                            <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-purple-500 transition-transform duration-300 
                            group-hover:scale-110 group-hover:rotate-12" />
                            <p className="text-sm md:text-base text-gray-700 group-hover:text-purple-700 transition-colors duration-300">
                              {feature}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        {/* How It Works Section - Responsive */}
        <section id="how-it-works" className="py-8 md:py-10 bg-gradient-to-b from-white to-gray-50 w-full">
          <div className="container mx-auto px-4">
            <h2 className="relative text-3xl md:text-4xl font-extrabold text-center mb-10 md:mb-20 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transform transition-all duration-300 hover:cursor-pointer">
              How It Works
              <span className="absolute -bottom-2 left-1/2 w-16 md:w-24 h-1 bg-blue-500 transform -translate-x-1/2 scale-0 transition-transform duration-300 group-hover:scale-100" />
            </h2>
            <div className="max-w-4xl mx-auto relative">
              {howItWorks.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start mb-10 md:mb-16 last:mb-0 group relative"
                >
                  {/* Vertical line segment for each step except last */}
                  {index < howItWorks.length - 1 && (
                    <div
                      className="absolute left-5 md:left-6 top-12 w-px h-[calc(100%+2rem)] md:h-[calc(100%+4rem)] -z-10"
                      style={{
                        background: `linear-gradient(180deg, 
                        ${step.color === 'blue' ? '#DBEAFE' : step.color === 'green' ? '#DCFCE7' :
                            step.color === 'yellow' ? '#FEF9C3' : '#E9D5FF'} 0%, 
                        ${howItWorks[index + 1].color === 'blue' ? '#DBEAFE' :
                            howItWorks[index + 1].color === 'green' ? '#DCFCE7' :
                              howItWorks[index + 1].color === 'yellow' ? '#FEF9C3' : '#E9D5FF'} 100%)`
                      }}
                    />
                  )}

                  {/* Icon container with solid white background */}
                  <div className={`
                  relative flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full 
                  bg-white
                  flex items-center justify-center mr-4 md:mr-6
                  transform transition-all duration-500 ease-in-out
                  group-hover:scale-110 group-hover:rotate-12
                  shadow-sm group-hover:shadow-md
                  border-2 border-${step.color}-200
                  group-hover:border-${step.color}-400
                `}>
                    {/* Pulsing background effect */}
                    <div className={`
                    absolute inset-0 rounded-full
                    bg-${step.color}-100 opacity-0
                    group-hover:opacity-100 group-hover:animate-ping
                  `} />
                    {step.icon}
                  </div>

                  {/* Content container */}
                  <div className="flex-grow transform transition-all duration-300 ease-in-out
                  translate-y-0 group-hover:-translate-y-1">
                    <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-sm
                    transition-all duration-300 ease-in-out
                    group-hover:shadow-xl border border-transparent
                    group-hover:border-gray-100">
                      <h3 className={`
                      text-lg sm:text-xl font-semibold mb-2 md:mb-3
                      text-gray-900 group-hover:text-${step.color}-600
                      transition-colors duration-300
                    `}>
                        Step {step.step}: {step.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-700
                      transition-colors duration-300">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Key Benefits - Responsive */}
        <section className="py-10 md:py-16 bg-gradient-to-b from-gray-50 to-white w-full">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center mb-10 md:mb-20">
              <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Key Benefits
              </h2>
              <p className="text-gray-600 text-base md:text-lg">
                Discover how our platform transforms the learning experience
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
              {benefits.map((benefit, index) => (
                <div key={index} className="group">
                  <Card className="h-full transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <CardContent className="p-4 sm:p-6 md:p-8">
                      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl mb-4 md:mb-6 flex items-center justify-center bg-gradient-to-r ${benefit.gradient} transform transition-transform group-hover:scale-110`}>
                        <div className="text-white w-6 h-6 md:w-8 md:h-8">
                          {benefit.icon}
                        </div>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-gray-800">
                        {benefit.title}
                      </h3>
                      <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                        {benefit.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-12 md:py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white w-full">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6">Ready to Transform Your Feedback Process?</h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">Join now and start improving your course feedback system with OpineBot.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto">
              <a href="/signup" className="bg-white text-blue-600 hover:bg-blue-50 py-3 px-8 rounded-lg shadow-lg transition-all duration-300 font-semibold text-base md:text-lg flex items-center justify-center">
                <UserPlus className="w-5 h-5 mr-2" />
                Sign Up Free
              </a>
              {/* <a href="/demo" className="bg-transparent border-2 border-white text-white hover:bg-white/10 py-3 px-8 rounded-lg transition-all duration-300 font-semibold text-base md:text-lg flex items-center justify-center">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </a> */}
            </div>
          </div>
        </section>

        {/* Footer - Responsive */}
        <footer className="w-full py-6 md:py-8 bg-slate-900 text-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <Typography as="a" href="#" className="text-xl md:text-2xl font-semibold">
                  OpineBot
                </Typography>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Smart Feedback for Modern Education</p>
              </div>
              <div className="flex space-x-6 mb-4 md:mb-0">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">About</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
              </div>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-700 text-center text-xs sm:text-sm text-gray-400">
              &copy; 2024 OpineBot. All rights reserved.
            </div>
          </div>
        </footer>

    </div>
  );
}
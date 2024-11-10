"use client";

import Image from 'next/image';
import React, { useState } from "react";
import { LampDemo } from "../components/ui/lamp";
import { HoverEffect } from "../components/ui/card_hover_effect";
import { BackgroundBeamsWithCollision } from "../components/ui/background_beams_with_collision";
import { HoveredLink, Menu, MenuItem } from "../components/ui/navbar_mwnu.js";
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
  RefreshCw 
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen ">

      {/* Navbar */}
      <Navbar className="sticky top-0 z-10 h-max max-w-full rounded-none px-4 ">
        <div className="flex items-center justify-between text-blue-gray-900">
          <Typography as="a" href="#" className="mx-5 pl-5 text-3xl cursor-pointer py-1.5 text-black font-semibold">
            OpineBot
          </Typography>
          <div className="flex items-center justify-between gap-1 bg-white shadow-lg rounded-full">
  <div className="mr-4 hidden lg:block">{navList}</div>

  {/* Menu items (Login/Signup) */}
  <div className="flex items-center  mr-7">
    <Menu setActive={setActive}>
      <a href="/login">
        <MenuItem
          setActive={setActive}
          active={active}
          item="Login"
        >
          {/* No hover effect */}
        </MenuItem>
      </a>

      <a href="/signup">
        <MenuItem
          setActive={setActive}
          active={active}
          item="Signup"
        >
          {/* No hover effect */}
        </MenuItem>
      </a>
    </Menu>
  </div>
</div>


        </div>
      </Navbar>

      {/* Hero Section */}
      <section className="flex flex-row justify-between flex-grow w-full mx-30 bg-violet-200">
        <div className='flex flex-col justify-center mx-16'>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Smart Feedback for
            <span className="text-blue-600 block">Modern Education</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Transform your course feedback with AI-powered conversations that engage students and provide deeper insights.
          </p>
        </div>
        <div>
          <Image src={logo} alt="Logo" className="mt-8 w-[1000px] h-auto" />
        </div>
      </section>

       {/* What to Expect Section */}
       <section className="py-16 bg-gradient-to-b from-gray-50 to-white w-full">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-4xl font-black text-center mb-16 text-gray-900 transition-all duration-300 hover:text-purple-600">
          What to Expect
        </h2>
        
        <Tabs defaultValue="students" className="max-w-4xl mx-auto">
          <TabsList className="grid grid-cols-2 mb-8 w-full  bg-gray-100 h-18 p-1 rounded-lg">
            {["students", "educators"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="text-xl font-semibold capitalize px-8 py-4 rounded-md transition-all duration-300
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
              <Card className="px-8 py-6 w-full bg-white shadow-lg rounded-xl
                transform transition-all duration-500 hover:scale-102 hover:shadow-xl
                border-2 border-transparent hover:border-purple-100">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold mb-8 text-gray-800 border-b pb-4">
                    {content.title}
                  </h3>
                  <div className="grid gap-6">
                    {content.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-4 p-3 rounded-lg
                          transition-all duration-300 hover:bg-purple-50 group"
                      >
                        <CheckCircle className="w-6 h-6 text-purple-500 transition-transform duration-300 
                          group-hover:scale-110 group-hover:rotate-12" />
                        <p className="text-gray-700 group-hover:text-purple-700 transition-colors duration-300">
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



      {/* How It Works Section */}
      <section className="py-10 bg-gradient-to-b from-white to-gray-50 w-full">
      <div className="container mx-auto px-4">
      <h2 className="relative text-4xl font-extrabold text-center mb-20 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transform transition-all duration-300 hover:cursor-pointer">
      How It Works
      <span className="absolute -bottom-2 left-1/2 w-24 h-1 bg-blue-500 transform -translate-x-1/2 scale-0 transition-transform duration-300 group-hover:scale-100" />
    </h2>
        <div className="max-w-4xl mx-auto relative">
          {howItWorks.map((step, index) => (
            <div
              key={index}
              className="flex items-start mb-16 last:mb-0 group relative"
            >
              {/* Vertical line segment for each step except last */}
              {index < howItWorks.length - 1 && (
                <div 
                  className="absolute left-6 top-12 w-px h-[calc(100%+4rem)] -z-10"
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
                relative flex-shrink-0 w-12 h-12 rounded-full 
                bg-white
                flex items-center justify-center mr-6
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
                <div className="bg-white p-6 rounded-xl shadow-sm
                  transition-all duration-300 ease-in-out
                  group-hover:shadow-xl border border-transparent
                  group-hover:border-gray-100">
                  <h3 className={`
                    text-xl font-semibold mb-3
                    text-gray-900 group-hover:text-${step.color}-600
                    transition-colors duration-300
                  `}>
                    Step {step.step}: {step.title}
                  </h3>
                  <p className="text-gray-600 group-hover:text-gray-700
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


      {/* Key Benefits */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white w-full">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-20">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Key Benefits
          </h2>
          <p className="text-gray-600 text-lg">
            Discover how our platform transforms the learning experience
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <div key={index} className="group">
              <Card className="h-full transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center bg-gradient-to-r ${benefit.gradient} transform transition-transform group-hover:scale-110`}>
                    <div className="text-white w-8 h-8">
                      {benefit.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

       
      </div>
    </section>

      {/* Final CTA */}
      {/* <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Feedback Process?</h2>
          <p className="text-xl mb-8">Join now and start improving your course feedback system with OpineBot.</p>
          <Button size="lg" className="bg-white text-blue-600">Get Started</Button>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="w-full py-8 bg-slate-900 text-white text-center">
        <p className="text-sm">&copy; 2024 OpineBot. All rights reserved.</p>
      </footer>

    </div>
  );
}

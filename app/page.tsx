// "use client";
// import React,{useState} from "react";
// // import { motion } from "framer-motion";
// import { LampDemo } from "../components/ui/lamp.js"; // Your LampDemo component
// // import { Button } from "../components/ui/button_lamp_demo.js"; // Optional Button component for CTA
// import { HoverEffect } from "../components/ui/card_hover_effect.js";
// import { BackgroundBeamsWithCollision } from "../components/ui/background_beams_with_collision.js"; 
// import { HoveredLink, Menu, MenuItem, ProductItem } from "../components/ui/navbar_mwnu.js";
// import { cn } from "@/lib/utils";
// const projects = [
//   {
//     // title: "Stripe",
//     description:
//       "A interactive feedback system that enables real-time, adaptive conversations with students, such as questions based on individual responses, fostering a more personalized experience",
//     // link: "https://stripe.com",
//   },
//   {
//     // title: "Netflix",
//     description:
//       "An automated feedback system based on a particular course syllabus",
//     // link: "https://netflix.com",
//   },
//   {
//     // title: "Google",
//     description:
//       "Insights for making student feedback more productive in terms of revising syllabus, teaching styles, redesign of curriculum, or changing the way courses are taught",
//     // link: "https://google.com",
//   },
 
// ];

// export default function LandingPage() {
//   const [active, setActive] = useState<string | null>(null);
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-100 to-gray-300">
 
//     <div
//       className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50 ", )}
//     >
//       <Menu setActive={setActive}>
//         <a href="">
//         <MenuItem setActive={setActive} active={active} item="Services">
//           <div className="flex flex-col space-y-4 text-sm">
          
//           </div>
//         </MenuItem>
//         </a>
       
//         <a href="/login">
//         <MenuItem setActive={setActive} active={active} item="Login">
//           <div className="flex flex-col space-y-4 text-sm">
          
//           </div>
//         </MenuItem>
//             </a>

//             <a href="/signup">
//         <MenuItem setActive={setActive} active={active} item="Signup">
//           <div className="flex flex-col space-y-4 text-sm">
            
//             <HoveredLink href="/enterprise">Enterprise</HoveredLink> 
//           </div>
//         </MenuItem>
//         </a>


//       </Menu>
//       </div>
    
//       <section className="flex flex-col items-center justify-center flex-grow w-full">
//         <LampDemo />
       
//       </section>


//       <section id="features" className="w-full py-0 bg-gray-100">
//       <BackgroundBeamsWithCollision className="">
//          <div className="max-w-7xl mx-auto text-center">
//           <h2 className="text-3xl font-semibold text-gray-800">What Services we offer</h2>
//           <div className="mt-10 grid grid-cols-1 md:grid-cols-1 gap-8">
//            <HoverEffect items={projects} className=""/>
//           </div>
//         </div>
     
//     </BackgroundBeamsWithCollision>
    
//       </section>

     
//       <footer className="w-full py-8 bg-slate-900 text-white text-center">
//         <p className="text-sm">
//           &copy; 2024 OpineBot. All rights reserved.
//         </p>
//       </footer>
//     </div>
//   );
// }

"use client";

import React, { useState } from "react";
import { LampDemo } from "../components/ui/lamp";
import { HoverEffect } from "../components/ui/card_hover_effect";
import { BackgroundBeamsWithCollision } from "../components/ui/background_beams_with_collision";
import { HoveredLink, Menu, MenuItem, ProductItem } from "../components/ui/navbar_mwnu.js";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
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
  Lightbulb,
  Clock,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";

const projects = [
  {

    description:
      "An interactive feedback system that enables real-time, adaptive conversations with students, such as questions based on individual responses, fostering a more personalized experience",
  },
  {
    description:
      "An automated feedback system based on a particular course syllabus",

  },
  {
    description:
      "Insights for making student feedback more productive in terms of revising syllabus, teaching styles, redesign of curriculum, or changing the way courses are taught",

  },
];

const howItWorks = [
  {
    step: 1,
    title: "Quick Setup",
    description: "Set up your course and customize feedback parameters in minutes",
    icon: <Settings className="w-6 h-6" />
  },
  {
    step: 2,
    title: "Student Engagement",
    description: "Students receive personalized, conversational feedback requests",
    icon: <Users className="w-6 h-6" />
  },
  {
    step: 3,
    title: "AI Processing",
    description: "Our AI analyzes responses and adapts questions in real-time",
    icon: <Zap className="w-6 h-6" />
  },
  {
    step: 4,
    title: "Real-time Analytics",
    description: "Receive detailed insights and actionable recommendations",
    icon: <BarChart2 className="w-6 h-6" />
  }
];

export default function LandingPage() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-100 to-gray-300">

      {/* Navbar */}
      <div className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50")}>
      <Menu setActive={setActive}>
         <a href="">
         <MenuItem setActive={setActive} active={active} item="Services">
           <div className="flex flex-col space-y-4 text-sm">
          
           </div>
         </MenuItem>
       </a>
                <a href="/login">
         <MenuItem setActive={setActive} active={active} item="Login">
           <div className="flex flex-col space-y-4 text-sm">
          
           </div>
         </MenuItem>
             </a>

             <a href="/signup">
         <MenuItem setActive={setActive} active={active} item="Signup">
           <div className="flex flex-col space-y-4 text-sm">
            
             <HoveredLink href="/enterprise">Enterprise</HoveredLink> 
           </div>
         </MenuItem>

        </a>


       </Menu>
      </div>

      {/* Hero Section with LampDemo */}
      <section className="flex flex-col items-center justify-center flex-grow w-full">
        <LampDemo />

      </section>

      {/* What to Expect Section */}
      <section className="w-full py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">What to Expect</h2>
          <Tabs defaultValue="students" className="max-w-4xl mx-auto">
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="students">For Students</TabsTrigger>
              <TabsTrigger value="educators">For Educators</TabsTrigger>
            </TabsList>
            <TabsContent value="students" className="space-y-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-2xl font-semibold mb-4">Student Experience</h3>
                  <div className="grid gap-4">
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-3" />
                      <p>Interactive chat-like interface instead of boring forms</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-3" />
                      <p>Personalized questions based on your responses</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-3" />
                      <p>Quick 5-minute feedback sessions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="educators" className="space-y-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-2xl font-semibold mb-4">Educator Dashboard</h3>
                  <div className="grid gap-4">
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-3" />
                      <p>Real-time feedback analysis and insights</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-3" />
                      <p>Trend identification and recommendation engine</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-3" />
                      <p>Custom report generation and sharing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Services Section with Background Beams */}
      <section id="features" className="w-full py-0 bg-gray-100">
       <BackgroundBeamsWithCollision className="">
          <div className="max-w-7xl mx-auto text-center">
           <h2 className="text-3xl font-semibold text-gray-800">What Services we offer</h2>
           <div className="mt-10 grid grid-cols-1 md:grid-cols-1 gap-8">
            <HoverEffect items={projects} className=""/>
           </div>
         </div>
   
     </BackgroundBeamsWithCollision>
    
       </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="max-w-4xl mx-auto">
            {howItWorks.map((step, index) => (
              <div key={index} className="flex items-start mb-12">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-6">
                  {step.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Step {step.step}: {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Benefits Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Key Benefits</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Lightbulb className="w-8 h-8 text-blue-500" />,
                title: "Smarter Insights",
                description: "AI-powered analysis provides deeper understanding of student feedback"
              },
              {
                icon: <MessageCircle className="w-8 h-8 text-blue-500" />,
                title: "Higher Engagement",
                description: "Interactive format leads to 85% higher participation"
              },
              {
                icon: <Clock className="w-8 h-8 text-blue-500" />,
                title: "Time Savings",
                description: "Automated analysis saves 10+ hours per course"
              }
            ].map((benefit, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Feedback Process?</h2>
          <p className="text-xl mb-8">Join hundreds of institutions already using our platform</p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-blue-700">
              Schedule Demo
            </Button>
          </div>
        </div>
=======
      
    
    
      </section>

      {/* Footer */}
      <footer className="w-full py-8 bg-gray-800 text-white text-center">
        <p>&copy; 2024 Conversational Feedback System. All rights reserved.</p>
      </footer>
    </div>
  );
}


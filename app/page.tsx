"use client";
import React,{useState} from "react";
// import { motion } from "framer-motion";
import { LampDemo } from "../components/ui/lamp.js"; // Your LampDemo component
// import { Button } from "../components/ui/button_lamp_demo.js"; // Optional Button component for CTA
import { HoverEffect } from "../components/ui/card_hover_effect.js";
import { BackgroundBeamsWithCollision } from "../components/ui/background_beams_with_collision.js"; 
import { HoveredLink, Menu, MenuItem, ProductItem } from "../components/ui/navbar_mwnu.js";
import { cn } from "@/lib/utils";
const projects = [
  {
   
    description:
      "A interactive feedback system that enables real-time, adaptive conversations with students, such as questions based on individual responses, fostering a more personalized experience",
 
  },
  {
 
    description:
      "An automated feedback system based on a particular course syllabus",
   
  },
  {
    // title: "Google",
    description:
      "Insights for making student feedback more productive in terms of revising syllabus, teaching styles, redesign of curriculum, or changing the way courses are taught",
    
  },
 
];

export default function LandingPage() {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-100 to-gray-300">

    <div
      className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50 ", )}
    >
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
          
          </div>
        </MenuItem>
        </a>


      </Menu>
      </div>
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-grow w-full">
        <LampDemo />
    
      </section>


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

      {/* Footer */}
      <footer className="w-full py-8 bg-slate-900 text-white text-center">
        <p className="text-sm">
          &copy; 2024 OpineBot. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

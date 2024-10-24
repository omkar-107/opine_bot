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
    // title: "Stripe",
    description:
      "A interactive feedback system that enables real-time, adaptive conversations with students, such as questions based on individual responses, fostering a more personalized experience",
    // link: "https://stripe.com",
  },
  {
    // title: "Netflix",
    description:
      "An automated feedback system based on a particular course syllabus",
    // link: "https://netflix.com",
  },
  {
    // title: "Google",
    description:
      "Insights for making student feedback more productive in terms of revising syllabus, teaching styles, redesign of curriculum, or changing the way courses are taught",
    // link: "https://google.com",
  },
 
];

export default function LandingPage() {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-100 to-gray-300">
      {/* Navbar */}
      {/* <nav className="w-full py-4 px-6 bg-white shadow-md">
  <div className="flex justify-between items-center max-w-7xl mx-auto">
    <h1 className="text-2xl font-bold text-slate-700">OpineBot</h1>
    <ul className="flex space-x-4">
      <li>
        <a href="#features" className="text-slate-600 hover:text-slate-900">
          Features
        </a>
      </li>
      <li>
        <a href="#about" className="text-slate-600 hover:text-slate-900">
          About
        </a>
      </li>
      <li>
        <a href="#contact" className="text-slate-600 hover:text-slate-900">
          Contact
        </a>
      </li>
      <li>
        <a
          href="#login"
          className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          Login
        </a>
      </li>
      <li>
        <a
          href="#signup"
          className="text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          Signup
        </a>
      </li>
    </ul>
  </div>
</nav> */}
    <div
      className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50 ", )}
    >
      <Menu setActive={setActive}>
        <a href="">
        <MenuItem setActive={setActive} active={active} item="Services">
          <div className="flex flex-col space-y-4 text-sm">
            {/* <HoveredLink href="/web-dev">Web Development</HoveredLink>
            <HoveredLink href="/interface-design">Interface Design</HoveredLink>
            <HoveredLink href="/seo">Search Engine Optimization</HoveredLink>
            <HoveredLink href="/branding">Branding</HoveredLink> */}
          </div>
        </MenuItem>
        </a>
        {/* <MenuItem setActive={setActive} active={active} item="Products">
          <div className="  text-sm grid grid-cols-2 gap-10 p-4">
            <ProductItem
              title="Algochurn"
              href="https://algochurn.com"
              src="https://assets.aceternity.com/demos/algochurn.webp"
              description="Prepare for tech interviews like never before."
            />
            <ProductItem
              title="Tailwind Master Kit"
              href="https://tailwindmasterkit.com"
              src="https://assets.aceternity.com/demos/tailwindmasterkit.webp"
              description="Production ready Tailwind css components for your next project"
            />
            <ProductItem
              title="Moonbeam"
              href="https://gomoonbeam.com"
              src="https://assets.aceternity.com/demos/Screenshot+2024-02-21+at+11.51.31%E2%80%AFPM.png"
              description="Never write from scratch again. Go from idea to blog in minutes."
            />
            <ProductItem
              title="Rogue"
              href="https://userogue.com"
              src="https://assets.aceternity.com/demos/Screenshot+2024-02-21+at+11.47.07%E2%80%AFPM.png"
              description="Respond to government RFPs, RFIs and RFQs 10x faster using AI"
            />
          </div>
        </MenuItem> */}
        <a href="/login">
        <MenuItem setActive={setActive} active={active} item="Login">
          <div className="flex flex-col space-y-4 text-sm">
            {/* <HoveredLink href="/hobby">Hobby</HoveredLink>
            <HoveredLink href="/individual">Individual</HoveredLink>
            <HoveredLink href="/team">Team</HoveredLink>
            <HoveredLink href="/enterprise">Enterprise</HoveredLink> */}
          </div>
        </MenuItem>
            </a>

            <a href="/signup">
        <MenuItem setActive={setActive} active={active} item="Signup">
          <div className="flex flex-col space-y-4 text-sm">
            {/* <HoveredLink href="/hobby">Hobby</HoveredLink>
            <HoveredLink href="/individual">Individual</HoveredLink>
            <HoveredLink href="/team">Team</HoveredLink>
            <HoveredLink href="/enterprise">Enterprise</HoveredLink> */}
          </div>
        </MenuItem>
        </a>


      </Menu>
      </div>
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-grow w-full">
        <LampDemo />
        {/* Moved the text paragraph here */}
        {/* <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-6 text-lg text-gray-600 max-w-xl text-center "
        >
          Our lamps are built with precision and care, ensuring the best quality and design for your space. Let's light up your world, the right way.
        </motion.p> */}
        {/* <Button className="mt-8" text="Get Started" href="#features" /> */}
      </section>


      <section id="features" className="w-full py-0 bg-gray-100">
      <BackgroundBeamsWithCollision className="">
         <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-gray-800">What Services we offer</h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-1 gap-8">
           <HoverEffect items={projects} className=""/>
          </div>
        </div>
      {/* <h2 className="text-2xl relative z-20 md:text-4xl lg:text-7xl font-bold text-center text-black dark:text-white font-sans tracking-tight"> */}
        {/* What&apos;s cooler than Beams?{" "} */}
        {/* <div className="relative mx-auto inline-block w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
          <div className="absolute left-0 top-[1px] bg-clip-text bg-no-repeat text-transparent bg-gradient-to-r py-4 from-purple-500 via-violet-500 to-pink-500 [text-shadow:0_0_rgba(0,0,0,0.1)]">
            <span className="">Exploding beams.</span>
          </div>
          <div className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 py-4">
            <span className="">Exploding beams.</span>
          </div>
        </div> */}
        
      {/* </h2> */}
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

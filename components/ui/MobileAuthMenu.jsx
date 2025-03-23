"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { LogIn, UserPlus, X } from 'lucide-react';
import { Typography } from "@material-tailwind/react";

const MobileAuthMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      {/* Hamburger button */}
      <button 
        className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
        onClick={toggleMenu}
        aria-label="Authentication menu"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-gray-800" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-800">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>
      
      {/* Mobile dropdown menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 overflow-hidden z-50 transform origin-top-right transition-all duration-200 ease-out">
          <div className="py-1">
            <a 
              href="/login" 
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              <LogIn className="w-5 h-5 mr-3" />
              <span className="font-medium">Log In</span>
            </a>
            <a 
              href="/signup" 
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              <UserPlus className="w-5 h-5 mr-3" />
              <span className="font-medium">Sign Up</span>
            </a>
          </div>
        </div>
      )}
      
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden" 
          onClick={toggleMenu}
          aria-hidden="true"
        ></div>
      )}
    </div>
  );
};

export default MobileAuthMenu;
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';

const ResponsiveNavigation = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.name || '');
  const [isMenuExpanded, setIsMenuExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-collapse menu on mobile
      if (window.innerWidth < 768) {
        setIsMenuExpanded(false);
      }
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Toggle menu
  const toggleMenu = () => {
    setIsMenuExpanded(!isMenuExpanded);
  };

  return (
    <div className="relative">
      {/* Hamburger button - visible only on mobile */}
      <button
        onClick={toggleMenu}
        className={`
          md:hidden p-2 rounded-lg mb-2
          ${isMenuExpanded ? "bg-purple-100 text-purple-700" : "bg-gray-100"}
        `}
        aria-label="Toggle menu"
      >
        <Menu size={24} />
      </button>

      {/* Navigation menu */}
      <AnimatePresence>
        {(!isMobile || isMenuExpanded) && (
          <motion.nav
            initial={isMobile ? { height: 0, opacity: 0 } : false}
            animate={isMobile ? { height: 'auto', opacity: 1 } : false}
            exit={isMobile ? { height: 0, opacity: 0 } : false}
            className="space-y-2 px-3 overflow-hidden"
          >
            {tabs.map((tab) => (
              <motion.button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  flex items-center w-full p-2 rounded-lg 
                  transition-colors duration-200
                  ${
                    activeTab === tab.name
                      ? "bg-purple-100 text-purple-700"
                      : "hover:bg-gray-100"
                  }
                `}
              >
                <tab.icon className="mr-3" size={20} />
                {(isMenuExpanded || !isMobile) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="text-sm">{tab.name}</p>
                    <p className="text-xs text-gray-500">{tab.description}</p>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResponsiveNavigation;
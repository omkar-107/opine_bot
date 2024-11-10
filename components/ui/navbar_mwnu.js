"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const MenuItem = ({
  setActive,
  active,
  item,
  children,
  
}) => {
  return (
    <div
      onMouseEnter={() => setActive(item)}
      className="relative group px-4 py-2 rounded-lg transition-all duration-300"
    >
      {/* Item Text */}
      <motion.p
        transition={{ duration: 0.3 }}
        className={`cursor-pointer text-lg font-medium text-gray-900 dark:text-white  ${
          active === item ? "text-blue-600 dark:text-blue-400" : ""
        }`}
      >
        {item}
      </motion.p>
    </div>
  );
};




export const Menu = ({
  setActive,
  children
}) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)}
      className="relative   dark:bg-black border-black[1/2] bg-white shadow-input flex justify-center space-x-4 px-8 py-6 w-[50%] mx-auto">
      {children}
    </nav>
  );
};


export const ProductItem = ({
  title,
  description,
  href,
  src
}) => {
  return (
    (<Link href={href} className="flex space-x-2">
      <Image
        src={src}
        width={140}
        height={70}
        alt={title}
        className="flex-shrink-0 rounded-md shadow-2xl" />
      <div>
        <h4 className="text-xl font-bold mb-1 text-black dark:text-white">
          {title}
        </h4>
        <p className="text-neutral-700 text-sm max-w-[10rem] dark:text-neutral-300">
          {description}
        </p>
      </div>
    </Link>)
  );
};

// export const HoveredLink = ({
//   children,
//   ...rest
// }) => {
//   return (
//     (<Link
//       {...rest}
//       className="text-neutral-700 dark:text-neutral-200 hover:text-black ">
//       {children}
//     </Link>)
//   );
// };

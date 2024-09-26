"use client";


import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";



export default function DashboardLayout({ children }) {
  const [isSuccess, setIsSuccess] = useState(false);
  const { push } = useRouter();

  useEffect(() => {
    (async () => {
      const { user, error } = await getUser();

      if (error) {
        push("/login");
        return;
      }
      setIsSuccess(true);
    })();
  }, [push]);

  if (!isSuccess) {
    return <p>Loading...</p>;
  }

  return (
    <main>
      <header>
        <Link href='/dashboard'>
          Dashboard
        </Link>
      </header>
      {children}
    </main>
  );
}

async function getUser(){
  try {
    let res = await fetch("/api/auth/me");
    res = await res.json();
    if (res.ok) {
        return {
            user: res.data,
            error: null,
        };
    }else{
        return {
            user: null,
            error: res.message,
        };
    }  
   
} catch (error) {
    return {
        user: null,
        error: error,
    };
}
}
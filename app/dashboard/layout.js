"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TailSpin } from 'react-loader-spinner'

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { push } = useRouter();

  useEffect(() => {
    (async () => {
      const { user, error } = await getUser();

      if (user && user.user === null) {
        push("/login");
        return;
      }
      if (user && user.user.role === 'admin') {
        push("/admin");
        return;
      }

      setUser(user.user);
      setIsSuccess(true);
    })();
  }, [push]);

  if (!isSuccess) {
    return <div className="flex flex-col w-full h-lvh justify-center items-center gap-2">
      <TailSpin
        visible={true}
        height="80"
        width="80"
        color="#7b61ff"
        ariaLabel="tail-spin-loading"
        radius="1"
        wrapperStyle={{}}
        wrapperClass=""
      />
      <p>Loading...</p>
    </div>;
  }

  return (
    <main>
      {/* <header>
        <Link href='/dashboard'>
          Dashboard
        </Link>
        {user && <p>Role: {user.role}</p>}
      </header> */}
      {children}
    </main>
  );
}

async function getUser() {
  try {
    let res = await fetch("/api/auth/me");
    res = await res.json();

    return {
      user: res.user,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: error,
    };
  }
}

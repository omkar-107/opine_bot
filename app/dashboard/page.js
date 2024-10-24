"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StudentDashboard from "./StudentDashboard";
import FacultyDashboard from "./FacultyDashboard";

async function handleLogout(router) {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  });
  if (response.ok) {
    router.push('/');
  } else {
    console.error('Failed to logout');
  }
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

export default function Page() {
  const router = useRouter();
  const [userobj, setUserObj] = useState({});

  useEffect(() => {
    (async () => {
      const { user, error } = await getUser();
      user
        ? setUserObj(user.user)
        : router.push("/login");
    })();
  }, []);



  return (
    <div>
      {userobj ? (
        userobj.role === 'student' ? (
          <StudentDashboard />
        ) : (

          userobj.role === 'faculty' ? (<FacultyDashboard />) : (
            <div>Other</div>)
        )
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}

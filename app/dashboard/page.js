"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

async function handleLogout(router){
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  });
  if (response.ok) {
    router.push('/');
  } else {
    console.error('Failed to logout');
  }
}

export default function Page() {
  const router = useRouter();

  return <div>authenticated users only
    <button className="flex" onClick={() => handleLogout(router)}>logout</button>
  </div>;
}

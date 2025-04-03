import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import StudentQuizView from "./StudentQuizView";
import { Loader } from "lucide-react";

export default function QuizPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication and get user data
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/user");
        res = await res.json();
        
        if (!res.ok) {
          throw new Error("Not authenticated");
        }
        
        // const userData = await res.json();
        setUser(res.user);
        
      } catch (error) {
        console.error("Authentication error:", error);
        router.push("/login?redirect=" + encodeURIComponent(router.asPath));
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return <StudentQuizView user={user} />;
}
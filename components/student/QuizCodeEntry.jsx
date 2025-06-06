"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

const QuizCodeEntry = ({ user }) => {
  const router = useRouter();
  const [quizCode, setQuizCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCodeChange = (e) => {
    setQuizCode(e.target.value);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!quizCode.trim()) {
      setError("Please enter a quiz code");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      // Check if quiz exists using the correct API path
      const response = await fetch(`/api/quiz/${quizCode}/check`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Quiz not found");
      }
      
      // Navigate to the quiz with corrected path
      router.push(`/quiz/${quizCode}`);
      
    } catch (error) {
      console.error("Error checking quiz:", error);
      setError(error.message || "Failed to find quiz");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto">
      <Card className="border-gray-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">Enter Quiz Code</h1>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="quizCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Quiz Code
                </label>
                <Input
                  id="quizCode"
                  placeholder="Enter digit code (e.g., Abc123...)"
                  value={quizCode}
                  onChange={handleCodeChange}
                  className="w-full p-3 text-lg font-mono tracking-wider text-center"
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
              </div>
              
              <div className="text-sm text-gray-600">
                <p>Enter the code provided by your instructor to access the quiz.</p>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="border-t border-gray-200 p-4 flex justify-end">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            onClick={handleSubmit}
            disabled={isLoading || !quizCode.trim()}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⟳</span>
                Checking...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Access Quiz
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizCodeEntry;
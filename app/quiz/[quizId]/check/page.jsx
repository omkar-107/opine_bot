"use client";

import { useState, useEffect } from "react";
import {
  ArrowRight,
  BookOpen,
  AlertCircle,
  Clock,
  CheckCircle2,
  List,
  UserCircle,
  BookText,
  Info,
  Search,
  Shield,
  Lock,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";

const InfoCard = ({ title, value, icon, gradientFrom, gradientTo }) => {
  return (
    <div className="bg-white p-3 md:p-4 rounded-xl shadow-md flex items-center justify-between">
      <div className="flex-1 mr-3 min-w-0">
        <p className="text-xs font-medium text-gray-500">{title}</p>
        <p className="text-sm md:text-base font-bold break-words overflow-wrap-anywhere">
          {value}
        </p>
      </div>
      <div
        className={`p-2 rounded-lg bg-gradient-to-r ${gradientFrom} ${gradientTo} flex-shrink-0`}
      >
        {icon}
      </div>
    </div>
  );
};

export default function CheckQuizPage({ params, searchParams }) {
  const router = useRouter();
  const routeParams = useParams();
  const quizId = params?.quizId || routeParams?.quizId;

  const [quizCode, setQuizCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [quizDetails, setQuizDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);

  // Fetch quiz details on load
  useEffect(() => {
    const fetchQuizDetails = async () => {
      if (!quizId) return;

      setIsLoadingDetails(true);
      try {
        const response = await fetch(`/api/student/quiz/getdetails/${quizId}`);
        if (!response.ok) {
          if (response.status === 404) {
            alert("Quiz not found. Please check the quiz ID.");
            window.close();
            return;
          }
          throw new Error("Failed to fetch quiz details");
        }

        const data = await response.json();
        setQuizDetails(data.quiz);
      } catch (error) {
        console.error("Error fetching quiz details:", error);
        alert("Failed to load quiz details. The page will close.");
        window.close();
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchQuizDetails();
  }, [quizId]);

  const handleCodeChange = (e) => {
    setQuizCode(e.target.value);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!quizCode.trim()) {
      setError("Please enter a quiz code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/student/quiz/check/${quizId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quiz_code: quizCode,
        }),
      });

      if (response.status === 409) {
        alert("Quiz already started or completed.");
        router.push("/dashboard");
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Quiz not found");
      }

      const responseData = await response.json();

      // Show success alert
      alert(`Successfully authorized: ${responseData.quiz.title}`);

      // Redirect to the quiz page
      router.push(`/quiz/${responseData.quiz.id}`);
    } catch (error) {
      console.error("Error checking quiz:", error);
      setError(error.message || "Failed to find quiz");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Quiz Details Card */}
        {isLoadingDetails ? (
          <div className="bg-white p-6 rounded-2xl shadow-lg mb-6 flex justify-center">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : quizDetails ? (
          <div className="bg-white p-6 rounded-2xl shadow-lg mb-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl mr-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                {quizDetails.title}
              </h1>
              <div
                className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
                  quizDetails.active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {quizDetails.active ? "Active" : "Inactive"}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 break-words">
              <InfoCard
                title="Questions"
                value={quizDetails.num_questions}
                icon={<List className="w-4 h-4 text-white" />}
                gradientFrom="from-blue-500"
                gradientTo="to-indigo-500"
              />
              <InfoCard
                title="Time Allowed"
                value={`${quizDetails.time} min`}
                icon={<Clock className="w-4 h-4 text-white" />}
                gradientFrom="from-orange-500"
                gradientTo="to-red-500"
              />
              <InfoCard
                title="Instructor"
                value={quizDetails.created_by_username}
                icon={<UserCircle className="w-4 h-4 text-white" />}
                gradientFrom="from-purple-500"
                gradientTo="to-pink-500"
              />
              <InfoCard
                title="Course"
                value={quizDetails.course_name}
                icon={<BookText className="w-4 h-4 text-white" />}
                gradientFrom="from-green-500"
                gradientTo="to-emerald-500"
              />
            </div>
          </div>
        ) : null}

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Quiz Code Entry */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Enter Quiz Access Code
                </h2>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="relative">
                  <input
                    id="quizCode"
                    placeholder="Enter code provided by instructor"
                    value={quizCode}
                    onChange={handleCodeChange}
                    className="w-full p-4 text-lg font-mono tracking-wider text-center border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  {error && (
                    <div className="mt-2 flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <button
                    className={`w-full p-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
                      isLoading || !quizCode.trim() || !quizDetails?.active
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-200"
                    }`}
                    onClick={handleSubmit}
                    disabled={
                      isLoading || !quizCode.trim() || !quizDetails?.active
                    }
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Verifying...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Start Quiz
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-indigo-700 font-medium">
                    Security Note
                  </p>
                  <p className="text-xs text-indigo-600 mt-1">
                    The access code ensures only authorized students can take
                    this quiz. Do not share this code with others.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                <Info className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Quiz Guidelines
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start p-3 bg-green-50 rounded-xl border border-green-100">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800">Learning Purpose</p>
                  <p className="text-sm text-green-700 mt-1">
                    This quiz is designed to help you practice and assess your
                    knowledge.
                  </p>
                </div>
              </div>

              <div className="flex items-start p-3 bg-red-50 rounded-xl border border-red-100">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-800">Important</p>
                  <p className="text-sm text-red-700 mt-1">
                    Do not share quiz access codes with anyone else.
                  </p>
                </div>
              </div>

              <div className="flex items-start p-3 bg-blue-50 rounded-xl border border-blue-100">
                <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-800">Assessment Note</p>
                  <p className="text-sm text-blue-700 mt-1">
                    The marks won't be considered for your formal
                    assessment/ISE.
                  </p>
                </div>
              </div>

              <div className="flex items-start p-3 bg-orange-50 rounded-xl border border-orange-100">
                <Clock className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-orange-800">Time Management</p>
                  <p className="text-sm text-orange-700 mt-1">
                    Ensure you have enough time to complete the quiz before
                    starting.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-xl text-center">
              <p className="font-medium text-white">
                All the best with your quiz!
              </p>
            </div>
          </div>
        </div>

        {/* Inactive Quiz Warning */}
        {quizDetails && !quizDetails.active && (
          <div className="mt-6 bg-red-50 p-4 rounded-xl border border-red-200 flex items-center justify-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <p className="text-red-700 font-medium">
              This quiz is currently inactive. Please contact your instructor
              for assistance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

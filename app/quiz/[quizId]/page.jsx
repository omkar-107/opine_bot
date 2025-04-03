"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Loader2, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

export default function QuizPage({ params }) {
  const router = useRouter();
  const { quizId } = params;

  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [userFeedback, setUserFeedback] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);

  // Fetch quiz data from API
  useEffect(() => {
    async function fetchQuiz() {
      if (!quizId) return;

      try {
        setLoading(true);
        const response = await fetch(
          `/api/student/quiz/getquestions/${quizId}`
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to load quiz");
        }

        const quizData = await response.json();
        // console.log("Quiz data received:", quizData); // Log the data to see its structure

        // Handle the nested structure where quiz data is inside a quiz property
        if (quizData.quiz) {
          setQuiz(quizData.quiz);

          // Initialize time if quiz has a time limit
          if (quizData.quiz.time) {
            setTimeRemaining(quizData.quiz.time * 60); // Convert minutes to seconds
          }

          // Initialize empty answers object
          const initialAnswers = {};
          if (Array.isArray(quizData.quiz.questions)) {
            quizData.quiz.questions.forEach((question, index) => {
              initialAnswers[index] = "";
            });
            setAnswers(initialAnswers);
          }
        } else {
          throw new Error("Invalid quiz data format");
        }
      } catch (err) {
        console.error("Error loading quiz:", err);
        setError(err.message || "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [quizId]);

  // Timer effect
  useEffect(() => {
    if (!timeRemaining || timeRemaining <= 0 || quizSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, quizSubmitted]);

  // Format time remaining
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Handle answer selection
  const handleAnswerSelect = (questionIndex, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  // Navigate to next/prev question
  const goToNextQuestion = () => {
    if (
      quiz &&
      quiz.questions &&
      currentQuestionIndex < quiz.questions.length - 1
    ) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Prepare submissions array in the format needed for backend
  const prepareSubmissionData = () => {
    if (!quiz || !quiz.questions) return null;

    const submissions = [];

    // Create an array of answer objects with question IDs
    Object.entries(answers).forEach(([index, answer]) => {
      const questionIndex = parseInt(index);
      if (quiz.questions[questionIndex]) {
        const question = quiz.questions[questionIndex];

        submissions.push({
          questionId: question._id,
          question: question.question_text,
          answer: answer,
        });
      }
    });

    return {
      quizId: quiz._id,
      title: quiz.title,
      timeSpent: (quiz.time || 0) * 60 - (timeRemaining || 0),
      submissions: submissions,
    };
  };

  // Calculate score based on user answers
  const calculateScore = (answers) => {
    if (!quiz || !quiz.questions)
      return { score: 0, totalPoints: 0, percentage: 0 };

    let score = 0;
    let totalPoints = 0;

    quiz.questions.forEach((question, index) => {
      totalPoints += question.points || 1; // Default to 1 point if not specified

      const userAnswer = answers[index];
      if (userAnswer === question.correctAnswer) {
        score += question.points || 1;
      }
    });

    const percentage = Math.round((score / totalPoints) * 100);

    return {
      score,
      totalPoints,
      percentage,
    };
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || !quiz.questions) return;
    try {
      setSubmitting(true);
      // Check if there are any answers
      const hasAnswers = Object.values(answers).some(
        (answer) => answer && answer.trim() !== ""
      );
      if (!hasAnswers) {
        throw new Error("No answers provided");
      }

      // Format data according to the new example structure
      const formattedAnswers = Object.entries(answers)
        .map(([index, selected_option]) => {
          const questionIndex = parseInt(index);
          const question = quiz.questions[questionIndex];

          return {
            question_id: question._id,
            question_text: question.question_text,
            selected_option: selected_option,
          };
        })
        .filter(
          (item) => item.selected_option && item.selected_option.trim() !== ""
        );

      // Prepare submission data in the new format
      const submissionData = {
        answers: formattedAnswers,
      };

      // Validate submission data
      if (formattedAnswers.length === 0) {
        throw new Error("No answers provided");
      }

      // console.log("Submitting data:", submissionData); // Debug submission data

      // Submit quiz answers to the backend
      const response = await fetch(`/api/student/quiz/submit/${quizId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit quiz");
      }

      // Store response data if needed
      const responseData = await response.json();
      setSubmissionData(responseData);

      // Calculate score for local display
      const resultData = calculateScore(answers);

      // Set results and show feedback form
      setResults(resultData);
      setQuizSubmitted(true);
    } catch (err) {
      console.error("Error submitting quiz:", err);
      setError(err.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      setSubmitting(true);

      // Simplify the feedback data structure to match the example format
      const feedbackData = {
        feedback: userFeedback,
      };

      // console.log("Submitting feedback:", feedbackData); // Debug feedback data

      // Send feedback to backend
      const response = await fetch(
        `/api/student/quiz/submit/feedback/${quizId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(feedbackData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit feedback");
      }

      // Store response data if needed
      const responseData = await response.json();
      // console.log("Feedback submission response:", responseData);

      setFeedbackSubmitted(true);
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setError(err.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
    //redirect to dashboard
    router.push("/dashboard");
  };
  // Loading state
  if (loading && !quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600">Loading quiz...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error && !quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p className="text-gray-700 text-center">{error}</p>
              <Button
                onClick={() => router.push("/dashboard")}
                className="mt-4"
              >
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results view with feedback submission
  if (quizSubmitted && results) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
            {/* <h1 className="text-2xl font-bold text-center">Quiz Results</h1> */}
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h2 className="text-xl font-semibold mb-1">Quiz Completed!</h2>
              <p className="text-gray-600">{quiz && quiz.title}</p>
              <p className="text-gray-500 mt-1">{quiz && quiz.course_name}</p>
              <p className="text-gray-700 mt-1 italic">Your Score: {submissionData && submissionData.score}</p>
            </div>

            {/* <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Score:</span>
                <span className="font-bold">{results.score}/{results.totalPoints}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="font-medium">Percentage:</span>
                <span className="font-bold">{results.percentage}%</span>
              </div>
              <Progress value={results.percentage} className="h-2" />
            </div> */}

            {!feedbackSubmitted ? (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Share your feedback:</h3>
                <Textarea
                  placeholder="Tell us what you thought about this quiz..."
                  className="w-full mb-4"
                  rows={4}
                  value={userFeedback}
                  onChange={(e) => setUserFeedback(e.target.value)}
                />
                <Button
                  onClick={handleFeedbackSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    "Submit Feedback"
                  )}
                </Button>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-700 text-center">
                  Thank you for your feedback!
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t p-4 flex justify-center">
            <Button
              onClick={() => router.push("/")}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              Return Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Quiz view - Check if quiz and quiz.questions exist
  if (quiz && quiz.questions && quiz.questions.length > 0) {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-xl font-bold">{quiz.title}</h1>
                <p className="text-sm text-gray-500">{quiz.course_name}</p>
                {/* {quiz.syllabus && <p className="text-xs text-gray-400 mt-1">{quiz.syllabus}</p>} */}
              </div>
              {timeRemaining !== null && (
                <div className="flex items-center bg-gray-100 px-3 py-2 rounded-full">
                  <Clock className="w-5 h-5 mr-2 text-gray-600" />
                  <span className="font-medium text-lg">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="mb-6">
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-500">
                  Question {currentQuestionIndex + 1}
                </span>
                <h2 className="text-lg font-medium mt-1">
                  {currentQuestion.question_text}
                </h2>
              </div>

              <div className="space-y-2 mt-4">
                {currentQuestion.options &&
                  currentQuestion.options.map((option, idx) => (
                    <div
                      key={idx}
                      className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 ${
                        answers[currentQuestionIndex] === option
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200"
                      }`}
                      onClick={() =>
                        handleAnswerSelect(currentQuestionIndex, option)
                      }
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-5 h-5 mr-3 border rounded-full ${
                            answers[currentQuestionIndex] === option
                              ? "bg-blue-500 border-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {answers[currentQuestionIndex] === option && (
                            <div className="w-3 h-3 bg-white rounded-full mx-auto mt-1"></div>
                          )}
                        </div>
                        <span>{option}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t p-4 flex justify-between">
            <Button
              variant="outline"
              onClick={goToPrevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>

            {currentQuestionIndex < quiz.questions.length - 1 ? (
              <Button
                onClick={goToNextQuestion}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmitQuiz}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  "Submit Quiz"
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  // If quiz exists but no questions or is in unexpected format
  if (quiz && (!quiz.questions || quiz.questions.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Questions Found</h2>
              <p className="text-gray-700 text-center">
                This quiz doesn't contain any questions.
              </p>
              <Button onClick={() => router.push("/")} className="mt-4">
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

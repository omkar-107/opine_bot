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
import { 
  Loader2, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  ArrowLeft, 
  ArrowRight,
  Home,
  BookOpen,
  X,
  HelpCircle,
  Flag
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

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
  const [localStorageInitialized, setLocalStorageInitialized] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [questionNavOpen, setQuestionNavOpen] = useState(false);
  const [timerWarning, setTimerWarning] = useState(false);

  // Navigate to dashboard
  const navigateToDashboard = () => {
    if (!quizSubmitted) {
      setShowExitConfirmation(true);
    } else {
      router.push("/dashboard");
    }
  };

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

        // Handle the nested structure where quiz data is inside a quiz property
        if (quizData.quiz) {
          setQuiz(quizData.quiz);

          // Check if there's saved data in localStorage
          const savedQuizState = getQuizStateFromLocalStorage(quizId);
          
          // If there's saved data and it's valid, restore it
          if (savedQuizState) {
            setCurrentQuestionIndex(savedQuizState.currentQuestionIndex || 0);
            setAnswers(savedQuizState.answers || {});
            
            // Only set timeRemaining from localStorage if time exists and hasn't expired
            if (savedQuizState.timeRemaining && savedQuizState.timeRemaining > 0) {
              setTimeRemaining(savedQuizState.timeRemaining);
            } else if (quizData.quiz.time) {
              // If no valid saved time, initialize with quiz time
              setTimeRemaining(quizData.quiz.time * 60);
            }
            
            // Restore submitted state if it exists
            if (savedQuizState.quizSubmitted) {
              setQuizSubmitted(savedQuizState.quizSubmitted);
              if (savedQuizState.results) {
                setResults(savedQuizState.results);
              }
            }
          } else {
            // Initialize with fresh data if no localStorage data
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
          }
          
          setLocalStorageInitialized(true);
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

  // Local storage functions
  const getQuizStateFromLocalStorage = (quizId) => {
    try {
      const savedState = localStorage.getItem(`quiz_${quizId}`);
      return savedState ? JSON.parse(savedState) : null;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  };

  const saveQuizStateToLocalStorage = () => {
    if (!quizId || !localStorageInitialized) return;
    
    try {
      const stateToSave = {
        answers,
        currentQuestionIndex,
        timeRemaining,
        quizSubmitted,
        results,
        lastUpdated: new Date().getTime()
      };
      
      localStorage.setItem(`quiz_${quizId}`, JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  // Effect to save state to localStorage whenever relevant state changes
  useEffect(() => {
    if (localStorageInitialized) {
      saveQuizStateToLocalStorage();
    }
  }, [answers, currentQuestionIndex, timeRemaining, quizSubmitted, results, localStorageInitialized]);

  // Auto-save timer
  useEffect(() => {
    // Set up an interval to save to localStorage every 5 seconds
    const autoSaveInterval = setInterval(() => {
      if (localStorageInitialized && !quizSubmitted) {
        saveQuizStateToLocalStorage();
      }
    }, 5000);

    return () => clearInterval(autoSaveInterval);
  }, [localStorageInitialized, quizSubmitted]);

  // Timer effect and warning
  useEffect(() => {
    if (!timeRemaining || timeRemaining <= 0 || quizSubmitted) return;

    // Set timer warning when 15% of time remains
    if (quiz && quiz.time && timeRemaining === Math.floor(quiz.time * 60 * 0.15)) {
      setTimerWarning(true);
      setTimeout(() => setTimerWarning(false), 5000);
    }

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
  }, [timeRemaining, quizSubmitted, quiz]);

  // Format time remaining
  const formatTime = (seconds) => {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Get progress status for progress bar color
  const getProgressStatus = () => {
    if (!quiz || !quiz.questions) return "bg-blue-500";
    
    const answeredCount = Object.values(answers).filter(ans => ans && ans.trim() !== "").length;
    const progress = (answeredCount / quiz.questions.length) * 100;
    
    if (progress < 30) return "bg-red-500";
    if (progress < 70) return "bg-yellow-500";
    return "bg-green-500";
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

  // Navigate to specific question
  const goToQuestion = (index) => {
    if (index >= 0 && quiz && quiz.questions && index < quiz.questions.length) {
      setCurrentQuestionIndex(index);
      setQuestionNavOpen(false);
    }
  };

  // Check if question is answered
  const isQuestionAnswered = (index) => {
    return answers[index] && answers[index].trim() !== "";
  };

  // Calculate completion percentage
  const calculateCompletion = () => {
    if (!quiz || !quiz.questions) return 0;
    
    const answeredCount = Object.values(answers).filter(ans => ans && ans.trim() !== "").length;
    return Math.round((answeredCount / quiz.questions.length) * 100);
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
      
      // Update localStorage with submitted state
      saveQuizStateToLocalStorage();
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
      setFeedbackSubmitted(true);
      
      // Clear quiz data from localStorage after successful submission
      try {
        localStorage.removeItem(`quiz_${quizId}`);
      } catch (error) {
        console.error("Error clearing localStorage:", error);
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setError(err.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
    //redirect to dashboard
    navigateToDashboard();
  };

  // Exit Confirmation Dialog
  const ExitConfirmationDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
      >
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Exit Quiz?</h3>
            <button 
              onClick={() => setShowExitConfirmation(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 mb-6">
            Your progress is saved, but are you sure you want to exit? You can resume this quiz later.
          </p>
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setShowExitConfirmation(false)}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => router.push("/dashboard")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save & Exit
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Question Navigation Panel
  const QuestionNavigationPanel = () => (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.3 }}
      className="fixed right-0 top-0 h-full bg-white shadow-xl w-72 z-40"
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-medium">Questions</h3>
        <button onClick={() => setQuestionNavOpen(false)} className="text-gray-500">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-2">
        <div className="flex justify-between items-center px-2 py-3 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>Answered</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
            <span>Unanswered</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {quiz && quiz.questions && quiz.questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToQuestion(idx)}
              className={`
                w-full aspect-square flex items-center justify-center rounded-md text-sm font-medium
                ${currentQuestionIndex === idx ? 'ring-2 ring-blue-500 ' : ''}
                ${isQuestionAnswered(idx) 
                  ? 'bg-green-100 text-green-800 border border-green-300' 
                  : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'}
              `}
            >
              {idx + 1}
            </button>
          ))}
        </div>
        <div className="mt-6 p-2">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Completion</span>
              <span className="font-medium">{calculateCompletion()}%</span>
            </div>
            <Progress 
              value={calculateCompletion()} 
              className="h-2" 
              indicatorClassName={getProgressStatus()}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
  
  // Loading state
  if (loading && !quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardContent className="p-8 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Loading Quiz</h2>
            <p className="text-gray-600 text-center">Please wait while we prepare your quiz...</p>
          </CardContent>
          <CardFooter className="pb-6 flex justify-center">
            <Button 
              onClick={navigateToDashboard} 
              variant="outline"
              className="flex items-center"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Error state
  if (error && !quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardContent className="p-8">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Oops, Something Went Wrong</h2>
              <p className="text-gray-700 text-center mb-6">{error}</p>
              <Button
                onClick={navigateToDashboard}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Home className="w-4 h-4 mr-2" />
                Return to Dashboard
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
        <Card className="shadow-lg border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 h-3"></div>
          <CardContent className="p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mb-6">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
              <p className="text-lg font-medium text-gray-800">{quiz && quiz.title}</p>
              <p className="text-gray-500 mb-4">{quiz && quiz.course_name}</p>
              
              <div className="w-full max-w-sm bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Your Score</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {submissionData && submissionData.score}
                  </span>
                </div>
                <Progress 
                  value={submissionData ? (submissionData.score / submissionData.totalScore) * 100 : 0} 
                  className="h-2 mb-2" 
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>0</span>
                  <span>{submissionData && submissionData.totalScore}</span>
                </div>
              </div>
            </div>

            {!feedbackSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
              >
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                  Share your feedback
                </h3>
                <Textarea
                  placeholder="What did you think about this quiz? Was it too easy, too difficult, or just right?"
                  className="w-full mb-4 border-gray-300 rounded-md"
                  rows={4}
                  value={userFeedback}
                  onChange={(e) => setUserFeedback(e.target.value)}
                />
                <Button
                  onClick={handleFeedbackSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    "Submit Feedback & Return to Dashboard"
                  )}
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
              >
                <p className="text-green-700 text-center flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Thank you for your feedback!
                </p>
              </motion.div>
            )}
          </CardContent>
          <CardFooter className="bg-gray-50 p-6 flex justify-center">
            <Button
              onClick={navigateToDashboard}
              className="bg-gray-800 hover:bg-gray-900 text-white"
            >
              Return to Dashboard
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
    const completionPercentage = calculateCompletion();

    return (
      <div className="min-h-screen bg-gray-50 py-6 px-4">
        {/* Timer Warning */}
        {timerWarning && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center"
          >
            <Clock className="w-5 h-5 mr-2" />
            <span>Warning: Less than 15% of your time remaining!</span>
          </motion.div>
        )}
        
        {/* Exit Confirmation Dialog */}
        {showExitConfirmation && <ExitConfirmationDialog />}
        
        {/* Question Navigation Panel */}
        {questionNavOpen && <QuestionNavigationPanel />}
        
        <div className="container mx-auto max-w-3xl">
          {/* Quiz Header */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex justify-between items-center">
            <div className="flex items-center">
              <BookOpen className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <h1 className="text-lg font-bold">{quiz.title}</h1>
                <p className="text-sm text-gray-500">{quiz.course_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setQuestionNavOpen(true)}
                className="text-gray-700 hover:text-blue-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full"
                title="Question Navigator"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              
              {timeRemaining !== null && (
                <div className={`flex items-center ${timeRemaining < (quiz.time * 60 * 0.15) ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-700'} px-4 py-2 rounded-full`}>
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="font-medium">{formatTime(timeRemaining)}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Main Quiz Card */}
          <Card className="shadow-lg border-0 overflow-hidden mb-4">
            <CardHeader className="border-b bg-white py-4">
              <div className="flex flex-col space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">
                    Question {currentQuestionIndex + 1} of {quiz.questions.length}
                  </span>
                  <div className="flex items-center">
                    <span className="mr-2">Completion</span>
                    <span className="font-medium">{completionPercentage}%</span>
                  </div>
                </div>
                <Progress value={progress} className="h-2.5 rounded-full" indicatorClassName={getProgressStatus()} />
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <motion.div 
                key={currentQuestionIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <div className="mb-5">
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mb-2">
                      Question {currentQuestionIndex + 1}
                    </span>
                    <h2 className="text-xl font-medium text-gray-800 mt-1">
                      {currentQuestion.question_text}
                    </h2>
                  </div>

                  <div className="space-y-3 mt-6">
                    {currentQuestion.options &&
                      currentQuestion.options.map((option, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                            answers[currentQuestionIndex] === option
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
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
                        </motion.div>
                  ))}              </div>
            </div>
            </motion.div>
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
      </div>

          );
        }
    

// Fix the structure of your final return statements
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

// Default fallback return if nothing else rendered
return null;
  
  }
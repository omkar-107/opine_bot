import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, Clock, Loader } from "lucide-react";
import { useRouter } from "next/router";

const StudentQuizView = ({ user }) => {
  const router = useRouter();
  const { quizCode } = router.query;
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState("pre-quiz"); // pre-quiz, questions, feedback, submitted
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch quiz by code
  useEffect(() => {
    if (!quizCode) return;
    
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/student/quiz/${quizCode}`);
        
        if (!response.ok) {
          throw new Error("Quiz not found or not active");
        }
        
        const data = await response.json();
        setQuiz(data);
        
        // Initialize answers object with empty values
        const initialAnswers = {};
        data.questions.forEach(question => {
          initialAnswers[question._id] = "";
        });
        setAnswers(initialAnswers);
        
        // Set timer
        setTimeRemaining(data.time * 60); // convert minutes to seconds
      } catch (error) {
        console.error("Error fetching quiz:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuiz();
  }, [quizCode]);
  
  // Timer functionality
  useEffect(() => {
    if (currentStep !== "questions" || timeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentStep, timeRemaining]);
  
  // Format time remaining as mm:ss
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Handle time up
  const handleTimeUp = () => {
    handleSubmitQuiz();
  };
  
  // Handle start quiz
  const handleStartQuiz = () => {
    setCurrentStep("questions");
  };
  
  // Handle answer selection
  const handleAnswerSelect = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };
  
  // Handle completion of questions
  const handleCompleteQuestions = () => {
    setCurrentStep("feedback");
  };
  
  // Handle feedback change
  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
  };
  
  // Submit quiz answers and feedback
  const handleSubmitQuiz = async () => {
    try {
      setIsSubmitting(true);
      
      // Prepare submission data
      const submission = {
        quizId: quiz._id,
        quizCode: quiz.quiz_code,
        studentId: user._id,
        studentName: user.username,
        answers: Object.entries(answers).map(([questionId, selectedOption]) => ({
          questionId,
          selectedOption
        })),
        feedback,
        timeSpent: quiz.time * 60 - timeRemaining,
        submittedAt: new Date()
      };
      
      // Send submission to API
      const response = await fetch("/api/student/quiz/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(submission)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit quiz");
      }
      
      // Handle successful submission
      setCurrentStep("submitted");
      
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("Failed to submit quiz: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader className="w-12 h-12 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">Loading quiz...</p>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Quiz Error</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => router.push("/student/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }
  
  // Render if no quiz found
  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Quiz Not Found</h2>
        <p className="text-gray-600 mb-4">The quiz you're looking for doesn't exist or is not active.</p>
        <Button onClick={() => router.push("/student/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }
  
  // Render Pre-Quiz screen
  if (currentStep === "pre-quiz") {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <Card className="border-gray-200 shadow-md">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
            <div className="flex flex-col space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{quiz.title}</h1>
              <p className="text-sm text-gray-600">Course: {quiz.course_name}</p>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-3 flex-1">
                  <Clock className="text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Duration</p>
                    <p className="text-lg font-semibold text-blue-700">{quiz.time} minutes</p>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg flex items-center gap-3 flex-1">
                  <div className="p-1 bg-purple-200 rounded-full">
                    <span className="text-purple-700 font-bold text-sm">?</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Questions</p>
                    <p className="text-lg font-semibold text-purple-700">{quiz.num_questions}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Instructions</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• This quiz contains {quiz.num_questions} multiple-choice questions.</li>
                  <li>• You have {quiz.time} minutes to complete the entire quiz.</li>
                  <li>• Once started, the timer cannot be paused.</li>
                  <li>• Submit your answers before the timer runs out.</li>
                  <li>• After submission, you cannot modify your answers.</li>
                </ul>
              </div>
              
              {quiz.syllabus && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Syllabus Coverage</h3>
                  <p className="text-sm text-gray-700">{quiz.syllabus}</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t border-gray-200 p-4 flex justify-end">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleStartQuiz}
            >
              Start Quiz
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Render Questions
  if (currentStep === "questions") {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="sticky top-0 z-10 bg-white pb-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">{quiz.title}</h1>
              <p className="text-sm text-gray-600">Course: {quiz.course_name}</p>
            </div>
            <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
              <Clock className="text-yellow-600 w-4 h-4" />
              <span className="font-mono font-medium text-yellow-700">
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
          <div className="mt-4 bg-gray-100 h-1 w-full rounded-full">
            <div 
              className="bg-blue-600 h-1 rounded-full" 
              style={{ width: `${Object.values(answers).filter(a => a !== "").length / quiz.questions.length * 100}%` }}
            ></div>
          </div>
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>{Object.values(answers).filter(a => a !== "").length} of {quiz.questions.length} answered</span>
            <span>{Math.round(Object.values(answers).filter(a => a !== "").length / quiz.questions.length * 100)}% complete</span>
          </div>
        </div>
        
        <div className="space-y-6">
          {quiz.questions.map((question, index) => (
            <Card key={question._id} className="border-gray-200">
              <CardHeader className="bg-gray-50 py-3 px-4 border-b border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold flex-shrink-0 text-sm">
                    {index + 1}
                  </div>
                  <h3 className="text-base font-medium text-gray-800">
                    {question.question_text}
                  </h3>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        answers[question._id] === option
                          ? "border-blue-400 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                      onClick={() => handleAnswerSelect(question._id, option)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                          answers[question._id] === option
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}>
                          {String.fromCharCode(65 + optIndex)}
                        </div>
                        <p className="text-sm text-gray-800">{option}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-8 flex justify-center">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            onClick={handleCompleteQuestions}
            disabled={Object.values(answers).some(a => a === "")}
          >
            Submit Answers
          </Button>
        </div>
      </div>
    );
  }
  
  // Render Feedback screen
  if (currentStep === "feedback") {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <Card className="border-gray-200">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-800">Almost Done!</h1>
            <p className="text-sm text-gray-600">Please provide some feedback on this quiz</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">How was your experience?</h3>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg min-h-32 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                placeholder="Share your thoughts on the quiz content, difficulty level, clarity of questions, etc."
                value={feedback}
                onChange={handleFeedbackChange}
              ></textarea>
            </div>
          </CardContent>
          <CardFooter className="border-t border-gray-200 p-4 flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep("questions")}>
              Back to Questions
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleSubmitQuiz}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader className="animate-spin w-4 h-4" />
                  Submitting...
                </span>
              ) : (
                "Submit Quiz"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Render Submitted screen
  if (currentStep === "submitted") {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Quiz Submitted!</h1>
              <p className="text-gray-600 mb-6">
                Your answers have been successfully recorded.
              </p>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => router.push("/student/dashboard")}
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return null;
};

export default StudentQuizView;
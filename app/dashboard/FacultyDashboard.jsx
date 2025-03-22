import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Bars, BallTriangle } from "react-loader-spinner";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  FileText,
  UserCircle2,
  LogOut,
  Bell,
  Settings,
  ClipboardList,
  ChevronRight,
  Calendar,
  Users,
  Book,
  PlusCircle,
  User,
  CheckCircle,
  Building2,
  BookOpen,
  AlertCircle,
  Clock,
  Trash2,
  X,
  Search,
  XCircle,
  Filter,
  ArrowLeft,
  CheckSquare,
  Eye,
  AlertTriangle,
  Lightbulb
} from "lucide-react";

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4 p-8 rounded-lg">
        <Bars
          height="80"
          width="80"
          color="#7b61ff"
          ariaLabel="loading-indicator"
          wrapperClass="flex justify-center"
          visible={true}
        />
        <p className="text-gray-600 font-medium text-lg">{message}</p>
      </div>
    </div>
  );
};

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

const DashboardContent = ({ userobj, loadingParent }) => {
  const [feedbackTasks, setFeedbackTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const fetchFeedbackTasks = async () => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }
      try {
        const response = await fetch(
          `/api/faculty/gettasks/${userobj.username}`
        );
        if (response.ok) {
          const data = await response.json();
          setFeedbackTasks(data);
          console.log("Fetched feedback tasks:", data);
        } else {
          console.error("Error fetching feedback tasks:", response.statusText);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbackTasks();
  }, [loadingParent]);

  if (loading) {
    return (
      <LoadingSpinner message="Hold on tight, loading your dashboard..." />
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 mb-8 shadow-sm">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Welcome to your Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Here's an overview of your activities and updates
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-500" />
          Feedback Tasks
        </h2>

        {feedbackTasks.length > 0 ? (
          <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2">
            {feedbackTasks.map((task, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={index}
              >
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            {task.title}
                          </h3>
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Book className="w-4 h-4" />
                              <span>Course ID: {task.course_id}</span>
                            </div>
                            {/* <div className="flex items-center gap-2 text-gray-600">
                              <Book className="w-4 h-4" />
                              <span>Course ID: {task.course_id}</span>
                            </div> */}
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>Created by: {task.created_by}</span>
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={task.active ? "success" : "destructive"}
                          className={`px-3 py-1 ${
                            task.active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {task.active ? "Active" : "Closed"}
                        </Badge>
                      </div>

                      <Button
                        onClick={() =>
                          window.open(
                            `${window.location.origin}/faculty/feedbacktask/${task._id}`,
                            "_blank"
                          )
                        }
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-2 rounded-lg transition-all duration-300 flex items-center gap-2"
                      >
                        View Feedback
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="bg-gray-50">
            <CardContent className="p-12 text-center text-gray-500">
              <p>No outstanding feedback tasks available at the moment.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

const NewFeedbackContent = ({ userobj }) => {
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(
          `/api/faculty/getcourses/${userobj.username}`
        );
        if (response.ok) {
          const data = await response.json();
          setCourses(data);
        } else {
          console.error("Failed to fetch courses");
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, [userobj.username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const created_by = userobj.username;

    const formData = {
      title,
      course_id: courseId,
      created_by,
      active: active,
    };

    try {
      const response = await fetch("/api/faculty/addtask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Feedback task created successfully!");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error creating feedback task:", error);
      alert("Failed to create feedback task.");
    } finally {
      setLoading(false);
      setTitle("");
      setCourseId("");
      setActive(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-2xl mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                <PlusCircle className="w-6 h-6" />
                Create New Feedback Task
              </h2>
              <p className="text-gray-500 mt-2">
                Fill in the details below to create a new feedback task
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-sm font-medium text-gray-700"
                >
                  Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Enter feedback title"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="courseId"
                  className="text-sm font-medium text-gray-700"
                >
                  Course
                </Label>
                <select
                  id="courseId"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50"
                >
                  <option value="" disabled>
                    Select a course
                  </option>
                  {courses.map((course) => (
                    <option key={course.id_} value={course.id_}>
                      {`${course.id_} - ${course.title}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-3">
                <User className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Faculty</p>
                  <p className="font-medium text-gray-900">
                    {userobj.username}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="active"
                    checked={active}
                    onCheckedChange={(checked) => setActive(checked)}
                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <Label
                    htmlFor="active"
                    className="text-sm font-medium text-gray-700"
                  >
                    Active Status
                  </Label>
                </div>
                <p className="text-sm text-gray-500">
                  {active
                    ? "Task will be visible to students"
                    : "Task will be hidden from students"}
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading || !title || !courseId}
                className={`w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Create Feedback Task
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

const FeedbackDashboardContent = () => {
  return (
    <div>
      {/* <h2 className="text-2xl font-bold mb-4">Feedback Analysis Dashboard</h2> */}
      <p>Coming soon!</p>
    </div>
  );
};

const CreateQuizContent = ({ userobj }) => {
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [time, setTime] = useState(30); // Default time: 30 minutes
  const [syllabus, setSyllabus] = useState("");
  const [questions, setQuestions] = useState([
    { question_text: "", options: ["", "", "", ""], correct_answer: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [courses, setCourses] = useState([]);
  const [facultyDetailsObj, setFacultyDetailsObj] = useState({});

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(
          `/api/faculty/getcourses/${userobj.username}`
        );
        if (response.ok) {
          const data = await response.json();
          setCourses(data);
        } else {
          console.error("Failed to fetch courses");
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    const fetchFacultyDetails = async () => {
      try {
        const response = await fetch(
          `/api/faculty/getdetails/${userobj.username}`
        );
        if (response.ok) {
          const data = await response.json();
          setFacultyDetailsObj(data);
        } else {
          console.error("Error fetching user details:", response.statusText);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchCourses();
    fetchFacultyDetails();
  }, [userobj.username]);

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleCorrectAnswerChange = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].correct_answer =
      updatedQuestions[questionIndex].options[optionIndex];
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question_text: "", options: ["", "", "", ""], correct_answer: "" },
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      const updatedQuestions = [...questions];
      updatedQuestions.splice(index, 1);
      setQuestions(updatedQuestions);
    }
  };

  const isFormValid = () => {
    if (!title || !courseId || !time) return false;

    for (const question of questions) {
      if (!question.question_text.trim()) return false;

      for (const option of question.options) {
        if (!option.trim()) return false;
      }

      if (!question.correct_answer) return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitSuccess(false);
    setSubmitError("");

    try {
      const response = await fetch("/api/faculty/quiz/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          num_questions: questions.length,
          created_by: facultyDetailsObj._id,
          course_id: courseId,
          time: parseInt(time),
          syllabus,
          questions,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitSuccess(true);
        resetForm();
      } else {
        setSubmitError(data.message || "Failed to create quiz");
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      setSubmitError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setCourseId("");
    setTime(30);
    setSyllabus("");
    setQuestions([
      { question_text: "", options: ["", "", "", ""], correct_answer: "" },
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-4xl mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Create New Quiz
              </h2>
              <p className="text-gray-500 mt-2">
                Fill in the details below to create a new quiz for your students
              </p>
            </div>

            {submitSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-lg bg-green-50 text-green-700 flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Quiz created successfully!</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto"
                  onClick={() => setSubmitSuccess(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5" />
                <span>{submitError}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto"
                  onClick={() => setSubmitError("")}
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="title"
                      className="text-sm font-medium text-gray-700"
                    >
                      Quiz Title
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="Enter quiz title"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="courseId"
                      className="text-sm font-medium text-gray-700"
                    >
                      Course
                    </Label>
                    <select
                      id="courseId"
                      value={courseId}
                      onChange={(e) => setCourseId(e.target.value)}
                      required
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50"
                    >
                      <option value="" disabled>
                        Select a course
                      </option>
                      {courses.map((course) => (
                        <option key={course.id_} value={course._id}>
                          {`${course.id_} - ${course.title}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="time"
                      className="text-sm font-medium text-gray-700 flex items-center gap-2"
                    >
                      <Clock size={16} className="text-blue-500" />
                      Time Limit (minutes)
                    </Label>
                    <Input
                      id="time"
                      type="number"
                      min="1"
                      max="180"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="syllabus"
                      className="text-sm font-medium text-gray-700 flex items-center gap-2"
                    >
                      <BookOpen size={16} className="text-blue-500" />
                      Syllabus Topics (optional)
                    </Label>
                    <Input
                      id="syllabus"
                      value={syllabus}
                      onChange={(e) => setSyllabus(e.target.value)}
                      placeholder="e.g., Chapter 1-3, Arrays, Functions"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-blue-800">
                    Questions ({questions.length})
                  </h3>
                  <Button
                    type="button"
                    onClick={addQuestion}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg flex items-center gap-2 py-2 px-3 text-sm"
                  >
                    <PlusCircle size={16} />
                    Add Question
                  </Button>
                </div>

                <div className="space-y-8">
                  {questions.map((question, qIndex) => (
                    <div
                      key={qIndex}
                      className="bg-white p-6 rounded-lg shadow-sm border border-blue-100"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-800">
                          Question {qIndex + 1}
                        </h4>
                        {questions.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeQuestion(qIndex)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label
                            htmlFor={`question-${qIndex}`}
                            className="text-sm font-medium text-gray-700"
                          >
                            Question Text
                          </Label>
                          <Textarea
                            id={`question-${qIndex}`}
                            value={question.question_text}
                            onChange={(e) =>
                              handleQuestionChange(
                                qIndex,
                                "question_text",
                                e.target.value
                              )
                            }
                            placeholder="Enter your question here"
                            required
                            className="mt-1 w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-gray-700">
                            Options
                          </Label>
                          {question.options.map((option, oIndex) => (
                            <div
                              key={oIndex}
                              className="flex items-center gap-3"
                            >
                              <div className="flex-1">
                                <Input
                                  value={option}
                                  onChange={(e) =>
                                    handleOptionChange(
                                      qIndex,
                                      oIndex,
                                      e.target.value
                                    )
                                  }
                                  placeholder={`Option ${oIndex + 1}`}
                                  required
                                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                                />
                              </div>
                              <div>
                                <input
                                  type="radio"
                                  name={`correct-${qIndex}`}
                                  checked={question.correct_answer === option}
                                  onChange={() =>
                                    handleCorrectAnswerChange(qIndex, oIndex)
                                  }
                                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <Label
                                  htmlFor={`correct-${qIndex}-${oIndex}`}
                                  className="ml-2 text-sm text-gray-600"
                                >
                                  Correct
                                </Label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !isFormValid()}
                className={`w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  loading || !isFormValid()
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Quiz...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Create Quiz
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

const ViewQuizzesContent = ({ userobj }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [uniqueCourses, setUniqueCourses] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const fetchQuizzes = async () => {
      let faculty_id = "";
      try {
        const response = await fetch(
          `/api/faculty/getdetails/${userobj.username}`
        );
        if (response.ok) {
          const data = await response.json();
          faculty_id = data._id;
        } else {
          console.error("Error fetching user details:", response.statusText);
        }
      } catch (error) {
        console.error("Error:", error);
      }

      try {
        const response = await fetch(
          `/api/faculty/quiz/getall/${faculty_id}`
        );
        if (response.ok) {
          const data = await response.json();
          setQuizzes(data);
          setFilteredQuizzes(data);

          // Extract unique course IDs
          const courses = [...new Set(data.map((quiz) => quiz.course_id))];
          setUniqueCourses(courses);
        } else {
          console.error("Failed to fetch quizzes");
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [userobj.username]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, activeFilter, courseFilter, sortBy, quizzes]);

  const applyFilters = () => {
    let filtered = [...quizzes];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.quiz_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.syllabus?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply active status filter
    if (activeFilter !== "all") {
      const isActive = activeFilter === "active";
      filtered = filtered.filter((quiz) => quiz.active === isActive);
    }

    // Apply course filter
    if (courseFilter !== "all") {
      filtered = filtered.filter((quiz) => quiz.course_id === courseFilter);
    }

    // Apply sorting
    filtered = sortQuizzes(filtered, sortBy);

    setFilteredQuizzes(filtered);
  };

  const sortQuizzes = (quizList, sortMethod) => {
    switch (sortMethod) {
      case "newest":
        return [...quizList].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      case "oldest":
        return [...quizList].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      case "alphabetical":
        return [...quizList].sort((a, b) => a.title.localeCompare(b.title));
      case "questions":
        return [...quizList].sort((a, b) => b.num_questions - a.num_questions);
      default:
        return quizList;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setActiveFilter("all");
    setCourseFilter("all");
    setSortBy("newest");
  };

  const LoadingSpinner = ({ message = "Loading..." }) => {
    return (
      <div className="h-64 w-full flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4 p-8 rounded-lg">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">{message}</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading quizzes..." />;
  }

  if (selectedQuiz) {
    return (
      <QuizDetailView
        quiz={selectedQuiz}
        onBack={() => setSelectedQuiz(null)}
      />
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8 mb-8 shadow-sm">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Quiz Management
        </h1>
        <p className="mt-2 text-gray-600">
          View, manage and analyze your quizzes
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <Input
              placeholder="Search quizzes by title, code or syllabus..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-5 bg-white border-gray-200"
            />
          </div>
        </div>

        <Button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Filter size={18} />
          Filters
          <Badge className="ml-1 bg-blue-100 text-blue-700 hover:bg-blue-200">
            {activeFilter !== "all" ||
            courseFilter !== "all" ||
            sortBy !== "newest"
              ? "Active"
              : ""}
          </Badge>
        </Button>
      </div>

      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 overflow-hidden"
          >
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Status
                    </Label>
                    <select
                      value={activeFilter}
                      onChange={(e) => setActiveFilter(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg bg-white"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Course
                    </Label>
                    <select
                      value={courseFilter}
                      onChange={(e) => setCourseFilter(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg bg-white"
                    >
                      <option value="all">All Courses</option>
                      {uniqueCourses.map((course) => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Sort By
                    </Label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg bg-white"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="alphabetical">Alphabetical</option>
                      <option value="questions">Most Questions</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      onClick={resetFilters}
                      variant="outline"
                      className="w-full"
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-500">
          {filteredQuizzes.length}
          {filteredQuizzes.length === 1 ? " quiz" : " quizzes"} found
        </p>

        <div className="flex items-center gap-4">
          <Badge
            variant="outline"
            className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200"
          >
            <CheckCircle size={14} />
            Active: {quizzes.filter((q) => q.active).length}
          </Badge>
          <Badge
            variant="outline"
            className="flex items-center gap-1 bg-gray-50 text-gray-700 border-gray-200"
          >
            <XCircle size={14} />
            Inactive: {quizzes.filter((q) => !q.active).length}
          </Badge>
        </div>
      </div>

      {filteredQuizzes.length > 0 ? (
        <div className="space-y-4">
          {filteredQuizzes.map((quiz) => (
            <motion.div
              key={quiz._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className="hover:shadow-md transition-all duration-300 cursor-pointer border-gray-200 overflow-hidden"
                onClick={() => setSelectedQuiz(quiz)}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <div
                      className={`w-2 sm:w-2 sm:h-auto ${
                        quiz.active ? "bg-green-500" : "bg-gray-300"
                      }`}
                    ></div>
                    <div className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <FileText size={18} className="text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-800">
                              {quiz.title}
                            </h3>
                            <Badge
                              variant={quiz.active ? "success" : "secondary"}
                              className={
                                quiz.active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {quiz.active ? "Active" : "Inactive"}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                              <Calendar size={14} />
                              <span>{formatDate(quiz.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                              <Clock size={14} />
                              <span>{quiz.time} minutes</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                              <BookOpen size={14} />
                              <span>{quiz.num_questions} questions</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                              <Book size={14} />
                              <span>Course: {quiz.course_id}</span>
                            </div>
                          </div>

                          {quiz.syllabus && (
                            <p className="text-sm text-gray-500 mt-2 line-clamp-1">
                              <span className="font-medium">Topics:</span>{" "}
                              {quiz.syllabus}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"
                          >
                            <Eye size={14} />
                            {quiz.responses.length} responses
                          </Badge>
                          <ChevronRight size={20} className="text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <AlertTriangle size={48} className="text-gray-300" />
              <h3 className="text-xl font-medium text-gray-700">
                No quizzes found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                No quizzes match your current filters. Try adjusting your search
                or filter criteria.
              </p>
              <Button variant="outline" onClick={resetFilters} className="mt-4">
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const QuizDetailView = ({ quiz, onBack }) => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-2 hover:bg-gray-100"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Quizzes
        </Button>

        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <span
                className="text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer"
                onClick={onBack}
              >
                Quizzes
              </span>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight size={12} className="text-gray-400" />
                <span className="ml-1 text-sm font-medium text-blue-600">
                  {quiz.title}
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8 mb-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {quiz.title}
              </h1>
              <Badge
                variant={quiz.active ? "success" : "secondary"}
                className={
                  quiz.active
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }
              >
                {quiz.active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="mt-2 text-gray-600">
              Quiz Code:{" "}
              <span className="font-mono font-medium">{quiz.quiz_code}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
              {quiz.active ? "Deactivate Quiz" : "Activate Quiz"}
            </Button>
            <Button variant="outline" className="w-full">
              Edit Quiz
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock size={20} className="text-blue-700" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Duration
                </h3>
                <p className="text-gray-600">{quiz.time} minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BookOpen size={20} className="text-purple-700" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Questions
                </h3>
                <p className="text-gray-600">{quiz.num_questions} total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <User size={20} className="text-green-700" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Responses
                </h3>
                <p className="text-gray-600">
                  {quiz.responses.length} received
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="questions" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="details">Quiz Details</TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-6">
          <Card className="border-gray-200">
            <CardHeader className="bg-gray-50 py-4 px-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Quiz Questions
              </h3>
            </CardHeader>
            <CardContent className="p-0">
              {quiz.questions.map((question, index) => (
                <div
                  key={question._id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <div className="p-6">
                    <div className="flex gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="space-y-4 flex-1">
                        <h4 className="text-base font-medium text-gray-800">
                          {question.question_text}
                        </h4>

                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`p-3 rounded-lg flex items-start gap-3 ${
                                option === question.correct_answer
                                  ? "bg-green-50 border border-green-200"
                                  : "bg-gray-50 border border-gray-200"
                              }`}
                            >
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  option === question.correct_answer
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-200 text-gray-700"
                                }`}
                              >
                                {String.fromCharCode(65 + optIndex)}
                              </div>
                              <div className="flex-1">
                                <p
                                  className={
                                    option === question.correct_answer
                                      ? "text-green-800"
                                      : "text-gray-700"
                                  }
                                >
                                  {option}
                                </p>
                              </div>
                              {option === question.correct_answer && (
                                <CheckSquare
                                  size={18}
                                  className="text-green-600 flex-shrink-0"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card className="border-gray-200">
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Quiz Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Course ID</p>
                    <p className="font-medium">{quiz.course_id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Created By</p>
                    <p className="font-medium">{quiz.created_by}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Created On</p>
                    <p className="font-medium">
                      {new Date(quiz.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">
                      {new Date(quiz.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {quiz.syllabus && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Syllabus Coverage
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-800">{quiz.syllabus}</p>
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Status Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge
                      variant={quiz.active ? "success" : "secondary"}
                      className={
                        quiz.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {quiz.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Started On</p>
                    <p className="font-medium">
                      {quiz.started_on
                        ? new Date(quiz.started_on).toLocaleString()
                        : "Not started yet"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Ended On</p>
                    <p className="font-medium">
                      {quiz.ended_on
                        ? new Date(quiz.ended_on).toLocaleString()
                        : "Not ended yet"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responses">
          <Card className="border-gray-200">
            <CardContent className="p-6">
              {quiz.responses.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-6">
                    Student Responses
                  </h3>
                  <p>Response details will be displayed here</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <AlertTriangle size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    No Responses Yet
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    This quiz hasn't received any responses yet. Responses will
                    appear here once students complete the quiz.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ProfileContent = ({ userobj }) => {
  const [userDetailsObj, setUserDetailsObj] = useState({});
  const [coursesDetails, setCoursesDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(
          `/api/faculty/getdetails/${userobj.username}`
        );
        if (response.ok) {
          const data = await response.json();
          setUserDetailsObj(data);
        } else {
          console.error("Error fetching user details:", response.statusText);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    const fetchCoursesDetails = async () => {
      try {
        const response = await fetch(
          `/api/faculty/getcourses/${userobj.username}`
        );
        if (response.ok) {
          const data = await response.json();
          setCoursesDetails(data);
        } else {
          console.error("Error fetching courses details:", response.statusText);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
    fetchCoursesDetails();
  }, [userobj.username]);

  if (loading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  // if (loading) {
  //   return (
  //     <div className="w-full h-full flex flex-col items-center justify-center gap-4">
  //       <BallTriangle
  //         height={100}
  //         width={100}
  //         radius={5}
  //         color="#7b61ff"
  //         ariaLabel="ball-triangle-loading"
  //         wrapperStyle={{}}
  //         wrapperClass=""
  //         visible={true}
  //       />
  //       <p>Loading profile...</p>
  //     </div>
  //   );
  // }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-4">
      {/* Profile Card */}
      <Card className="overflow-hidden bg-gradient-to-br from-blue-50 to-white">
        <CardHeader className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{userDetailsObj.username}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Building2 size={16} />
                <span className="text-sm opacity-90">
                  {userDetailsObj.department}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Courses Section */}
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between border-b border-blue-100 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="text-blue-700" />
            <h2 className="text-xl font-semibold text-blue-900">Courses</h2>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {coursesDetails.length} Courses
          </Badge>
        </CardHeader>
        <CardContent className="pt-4">
          {coursesDetails.length > 0 ? (
            <div className="grid gap-4">
              {coursesDetails.map((course) => (
                <div
                  key={course.id_}
                  className="group p-4 rounded-lg transition-all duration-200 hover:bg-blue-50 cursor-pointer border border-blue-100 hover:border-blue-300"
                  onClick={() =>
                    setSelectedCourse(
                      selectedCourse?.id_ === course.id_ ? null : course
                    )
                  }
                >
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <h3 className="font-mono text-lg font-bold tracking-wider text-gray-900">
                        {course.id_}
                      </h3>
                      <p className="text-blue-700 group-hover:text-blue-800 transition-colors">
                        {course.title}
                      </p>
                    </div>
                    <div
                      className={`transform transition-transform duration-200 ${
                        selectedCourse?.id_ === course.id_ ? "rotate-180" : ""
                      }`}
                    >
                      <AlertCircle
                        size={20}
                        className="text-blue-400 group-hover:text-blue-600"
                      />
                    </div>
                  </div>

                  {/* Expanded Course Details */}
                  {selectedCourse?.id_ === course.id_ && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg animate-fadeIn">
                      <div className="flex items-start gap-3">
                        <Badge className="bg-blue-700 text-white mt-1">
                          Details
                        </Badge>
                        <div>
                          <p className="text-sm text-blue-800 font-medium">
                            Course ID:{" "}
                            <span className="font-mono">{course.id_}</span>
                          </p>
                          <p className="text-sm text-blue-700 mt-1">
                            Click to view more details about this course.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen size={48} className="mx-auto mb-4 text-blue-300" />
              <p>No courses found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const tabs = [
  {
    name: "Dashboard",
    component: DashboardContent,
    icon: LayoutDashboard,
  },
  {
    name: "Create Feedback",
    component: NewFeedbackContent,
    icon: FileText,
  },
  {
    name: "View Feedbacks",
    component: FeedbackDashboardContent,
    icon: ClipboardList,
  },
  {
    name: "Create Quiz",
    component: CreateQuizContent,
    icon: BookOpen,
  },
  {
    name: "View Quizzes",
    component: ViewQuizzesContent,
    icon: Lightbulb,
  },
  {
    name: "Profile",
    component: ProfileContent,
    icon: UserCircle2,
  },
];

const FacultyDashboard = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [userobj, setUserObj] = useState({});
  const [logoutActive, setLogoutActive] = useState(true);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  useEffect(() => {
    (async () => {
      const { user, error } = await getUser();
      if (user) {
        setUserObj(user.user);
      } else {
        router.push("/login");
      }
      setLoading(false);
    })();
  }, []);

  async function handleLogout() {
    setLogoutActive(false);
    setIsLoggingOut(true);
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });
    if (response.ok) {
      router.push("/");
    } else {
      console.error("Failed to logout");
    }
  }
  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return (
          <DashboardContent
            userobj={userobj}
            loadingParent={userobj.username === undefined}
          />
        );
      case "Create Feedback":
        return <NewFeedbackContent userobj={userobj} />;
      case "View Feedbacks":
        return <FeedbackDashboardContent userobj={userobj} />;
      case "Create Quiz":
        return <CreateQuizContent userobj={userobj} />;
      case "View Quizzes":
        return <ViewQuizzesContent userobj={userobj} />;
      case "Profile":
        return <ProfileContent userobj={userobj} />;
      default:
        return <DashboardContent userobj={userobj} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <motion.div
        initial={{ width: "80px" }}
        animate={{ width: isMenuExpanded ? "280px" : "80px" }}
        transition={{ type: "tween", duration: 0.3 }}
        className="bg-white shadow-xl z-10 relative"
      >
        <div className="p-4 flex items-center justify-between">
          <AnimatePresence>
            {isMenuExpanded && (
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xl font-bold text-gray-800"
              >
                {/* Faculty Hub */}
              </motion.h2>
            )}
          </AnimatePresence>
          <div className="absolute top-1/2 -translate-y-1/2 -right-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuExpanded(!isMenuExpanded)}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center items-center shadow-md"
            >
              <ChevronRight
                className={`transform transition-transform ${
                  isMenuExpanded ? "rotate-180" : ""
                }`}
                size={16}
              />
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center px-3 mt-4">
          <Avatar className="mb-4">
            {/* <AvatarImage src={userobj?.avatar} /> */}
            <AvatarFallback>
              {/* {userobj?.username?.[0]?.toUpperCase() || 'U'} */}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {isMenuExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <h3 className="font-semibold">
                  {userobj?.username || "Faculty Member"}
                </h3>
                <p className="text-sm text-gray-500">Faculty</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator className="my-4" />

        <nav className="space-y-2 px-3">
          {tabs.map((tab) => (
            <motion.button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                flex items-center w-full p-2 rounded-lg 
                transition-colors duration-200
                ${
                  activeTab === tab.name
                    ? "bg-purple-100 text-purple-700"
                    : "hover:bg-gray-100"
                }
              `}
            >
              <tab.icon className="mr-3" size={20} />
              {isMenuExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="text-sm">{tab.name}</p>
                  <p className="text-xs text-gray-500">{tab.description}</p>
                </motion.div>
              )}
            </motion.button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`flex items-center justify-center w-full py-3 text-white rounded-xl transition-all duration-300 bg-gradient-to-r from-red-600 to-red-700 shadow-lg shadow-red-200 relative overflow-hidden ${
              isLoggingOut ? "cursor-not-allowed opacity-75" : "hover:shadow-xl"
            }`}
            title={!isMenuExpanded ? "Logout" : ""}
          >
            <div
              className={`flex items-center justify-center gap-3 ${
                isLoggingOut ? "opacity-0" : "opacity-100"
              } transition-opacity duration-200`}
            >
              <LogOut className="w-5 h-5" />
              {isMenuExpanded && <span className="font-medium">Logout</span>}
            </div>

            {isLoggingOut && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <header className="flex justify-between items-center mb-6">
          <motion.h1
            className="text-3xl font-bold text-gray-800"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* {activeTab} */}
          </motion.h1>
          {/* <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon">
              <Settings size={20} />
            </Button>
            <Button variant="outline" size="icon" className="relative">
              <Bell size={20} />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-xs">
                3
              </span>
            </Button>
            <Avatar>
              <AvatarImage src={userobj?.avatar} />
              <AvatarFallback>
                {userobj?.username?.[0]?.toUpperCase() || 'F'}
              </AvatarFallback>
            </Avatar>
          </div> */}
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
export default FacultyDashboard;

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  Clock,
  FileText,
  PlusCircle,
  RotateCw,
  Trash2,
  X,
  ListOrdered,
  BarChart2,
} from "lucide-react";

const CreateQuizContent = ({ userobj }) => {
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [time, setTime] = useState(30); // Default time: 30 minutes
  const [syllabus, setSyllabus] = useState("");
  const [questions, setQuestions] = useState([
    { question_text: "", options: ["", "", "", ""], correct_answer: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [courses, setCourses] = useState([]);
  const [facultyDetailsObj, setFacultyDetailsObj] = useState({});
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [courseName, setCourseName] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [questionDifficulty, setQuestionDifficulty] = useState("Medium"); // No default selection

  useEffect(() => {
    // Track window resize for responsiveness
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

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

  const handleGenerateQuestions = async () => {
    if (!syllabus && !courseId) {
      setSubmitError("Please select a course and specify syllabus topics");
      return;
    }

    setGenerateLoading(true);
    setSubmitError("");

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND;
    try {
      // Using axios instead of fetch
      const response = await axios.post(
        `${baseUrl}/generate_questions`,
        {
          syllabus: syllabus || "General topics",
          num_questions: questionCount,
          difficulty: questionDifficulty,
        },
        {
          withCredentials: true, // This ensures cookies are sent with the request
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      if (data.success) {
        // Transform generated questions to match the required format
        const generatedQuestions = data.questions.map((q) => ({
          question_text: q.question,
          options: q.options,
          correct_answer: q.options[q.answer],
        }));

        setQuestions(generatedQuestions);
      } else {
        setSubmitError("Failed to generate questions");
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      setSubmitError("An unexpected error occurred while generating questions");
    } finally {
      setGenerateLoading(false);
    }
  };

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

    if (!syllabus) return false;

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

    courses.forEach((course) => {
      if (course._id === courseId) {
        setCourseName(`${course.id_} - ${course.title}`);
      }
    });

    try {
      const response = await fetch("/api/faculty/quiz/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          num_questions: questions.length,
          created_by_id: facultyDetailsObj._id,
          created_by_username: userobj.username,
          course_id: courseId,
          course_name: courseName,
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
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full border-0 shadow-md bg-white/90 backdrop-blur-sm">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                <FileText className="w-5 h-5 md:w-6 md:h-6" />
                Create New Quiz
              </h2>
              <p className="text-sm md:text-base text-gray-500 mt-1 md:mt-2">
                Fill in the details below to create a new quiz for your students
              </p>
            </div>

            {submitSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 md:mb-6 p-3 rounded-lg bg-green-50 text-green-700 flex items-center text-sm md:text-base gap-2"
              >
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
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
                className="mb-4 md:mb-6 p-3 rounded-lg bg-red-50 text-red-700 flex items-center text-sm md:text-base gap-2"
              >
                <AlertCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                <span className="line-clamp-2">{submitError}</span>
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

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1 md:space-y-2">
                    <Label
                      htmlFor="title"
                      className="text-xs md:text-sm font-medium text-gray-700"
                    >
                      Quiz Title
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="Enter quiz title"
                      className="w-full p-2 md:p-3 text-sm md:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50"
                    />
                  </div>

                  <div className="space-y-1 md:space-y-2">
                    <Label
                      htmlFor="courseId"
                      className="text-xs md:text-sm font-medium text-gray-700"
                    >
                      Course
                    </Label>
                    <select
                      id="courseId"
                      value={courseId}
                      onChange={(e) => setCourseId(e.target.value)}
                      required
                      className="w-full p-2 md:p-3 text-sm md:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1 md:space-y-2">
                    <Label
                      htmlFor="time"
                      className="text-xs md:text-sm font-medium text-gray-700 flex items-center gap-1 md:gap-2"
                    >
                      <Clock size={14} className="text-blue-500" />
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
                      className="w-full p-2 md:p-3 text-sm md:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50"
                    />
                  </div>

                  <div className="space-y-1 md:space-y-2">
                    <Label
                      htmlFor="questionCount"
                      className="text-xs md:text-sm font-medium text-gray-700 flex items-center gap-1 md:gap-2"
                    >
                      <ListOrdered size={14} className="text-blue-500" />
                      Number of Questions
                    </Label>
                    <Input
                      id="questionCount"
                      type="number"
                      min="1"
                      max="50"
                      value={questionCount}
                      onChange={(e) =>
                        setQuestionCount(parseInt(e.target.value, 10))
                      }
                      required
                      className="w-full p-2 md:p-3 text-sm md:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1 md:space-y-2">
                    <Label
                      htmlFor="questionDifficulty"
                      className="text-xs md:text-sm font-medium text-gray-700 flex items-center gap-1 md:gap-2"
                    >
                      <BarChart2 size={14} className="text-blue-500" />
                      Difficulty Level
                    </Label>
                    <select
                      id="questionDifficulty"
                      value={questionDifficulty}
                      onChange={(e) => setQuestionDifficulty(e.target.value)}
                      required
                      className="w-full p-2 md:p-3 text-sm md:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50"
                    >
                      <option value="" disabled>
                        Select difficulty
                      </option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div className="space-y-1 md:space-y-2">
                    <Label
                      htmlFor="syllabus"
                      className="text-xs md:text-sm font-medium text-gray-700 flex items-center gap-1 md:gap-2"
                    >
                      <BookOpen size={14} className="text-blue-500" />
                      Syllabus Topics
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="syllabus"
                        value={syllabus}
                        onChange={(e) => setSyllabus(e.target.value)}
                        placeholder="e.g., Chapter 1-3, Arrays, Functions"
                        className="w-full p-2 md:p-3 text-sm md:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50"
                        required
                      />
                      <Button
                        type="button"
                        onClick={handleGenerateQuestions}
                        disabled={generateLoading}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg flex items-center justify-center gap-1 md:gap-2 py-2 md:py-3 px-2 md:px-3 text-xs md:text-sm"
                      >
                        {generateLoading ? (
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <RotateCw size={14} className="flex-shrink-0" />
                        )}
                        Generate
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-3 md:p-4 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 md:mb-4">
                  <h3 className="text-base md:text-lg font-semibold text-blue-800">
                    Questions ({questions.length})
                  </h3>
                  <Button
                    type="button"
                    onClick={addQuestion}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg flex items-center justify-center sm:justify-start gap-1 md:gap-2 py-1 md:py-2 px-2 md:px-3 text-xs md:text-sm w-full sm:w-auto"
                  >
                    <PlusCircle size={14} className="flex-shrink-0" />
                    Add Question
                  </Button>
                </div>

                <div className="space-y-4 md:space-y-6">
                  {questions.map((question, qIndex) => (
                    <div
                      key={qIndex}
                      className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-blue-100"
                    >
                      <div className="flex items-center justify-between mb-2 md:mb-4">
                        <h4 className="font-semibold text-sm md:text-base text-gray-800">
                          Question {qIndex + 1}
                        </h4>
                        {questions.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeQuestion(qIndex)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                          >
                            <Trash2 size={16} className="flex-shrink-0" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-3 md:space-y-4">
                        <div>
                          <Label
                            htmlFor={`question-${qIndex}`}
                            className="text-xs md:text-sm font-medium text-gray-700"
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
                            className="mt-1 w-full p-2 md:p-3 text-sm md:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                          />
                        </div>

                        <div className="space-y-2 md:space-y-3">
                          <Label className="text-xs md:text-sm font-medium text-gray-700">
                            Options
                          </Label>
                          {question.options.map((option, oIndex) => (
                            <div
                              key={oIndex}
                              className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3"
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
                                  className="w-full p-2 md:p-3 text-sm md:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                                />
                              </div>
                              <div className="flex items-center justify-end mt-1 sm:mt-0">
                                <input
                                  type="radio"
                                  id={`correct-${qIndex}-${oIndex}`}
                                  name={`correct-${qIndex}`}
                                  checked={question.correct_answer === option}
                                  onChange={() =>
                                    handleCorrectAnswerChange(qIndex, oIndex)
                                  }
                                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <Label
                                  htmlFor={`correct-${qIndex}-${oIndex}`}
                                  className="ml-2 text-xs md:text-sm text-gray-600"
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
                className={`w-full py-2 md:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm md:text-base font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  loading || !isFormValid()
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="ml-1">Creating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
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

export default CreateQuizContent;

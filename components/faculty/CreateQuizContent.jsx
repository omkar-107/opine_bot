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
  Trash2,
  X,
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

export default CreateQuizContent;

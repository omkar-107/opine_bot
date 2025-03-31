import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Trash2,
  Plus,
} from "lucide-react";
import { useState } from "react";

const EditQuizView = ({
  quiz,
  onBack,
  isMobile,
  isTablet,
  userobj,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    title: quiz.title,
    quiz_code: quiz.quiz_code,
    time: quiz.time,
    syllabus: quiz.syllabus || "",
    questions: JSON.parse(JSON.stringify(quiz.questions)), // Deep copy to avoid mutation
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [field]: value,
      };
      return {
        ...prev,
        questions: updatedQuestions,
      };
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setFormData((prev) => {
      const updatedQuestions = [...prev.questions];
      const updatedOptions = [...updatedQuestions[questionIndex].options];
      updatedOptions[optionIndex] = value;

      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: updatedOptions,
      };

      const originalQuestion = quiz.questions[questionIndex];
      if (
        originalQuestion &&
        originalQuestion.options &&
        originalQuestion.options[optionIndex] &&
        updatedQuestions[questionIndex].correct_answer ===
          originalQuestion.options[optionIndex]
      ) {
        updatedQuestions[questionIndex].correct_answer = value;
      }

      return {
        ...prev,
        questions: updatedQuestions,
      };
    });
  };

  const handleCorrectAnswerChange = (questionIndex, optionValue) => {
    setFormData((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        correct_answer: optionValue,
      };
      return {
        ...prev,
        questions: updatedQuestions,
      };
    });
  };

  const moveQuestionUp = (index) => {
    if (index === 0) return;

    setFormData((prev) => {
      const updatedQuestions = [...prev.questions];
      const temp = updatedQuestions[index];
      updatedQuestions[index] = updatedQuestions[index - 1];
      updatedQuestions[index - 1] = temp;

      return {
        ...prev,
        questions: updatedQuestions,
      };
    });
  };

  const moveQuestionDown = (index) => {
    if (index === formData.questions.length - 1) return;

    setFormData((prev) => {
      const updatedQuestions = [...prev.questions];
      const temp = updatedQuestions[index];
      updatedQuestions[index] = updatedQuestions[index + 1];
      updatedQuestions[index + 1] = temp;

      return {
        ...prev,
        questions: updatedQuestions,
      };
    });
  };

  const toggleQuestionExpand = (index) => {
    setExpandedQuestion(expandedQuestion === index ? null : index);
  };

  const addNewQuestion = () => {
    setFormData((prev) => {
      const newQuestion = {
        question_text: "",
        options: ["", "", "", ""],
        correct_answer: "",
      };

      return {
        ...prev,
        questions: [...prev.questions, newQuestion],
      };
    });

    // Expand the newly added question
    setTimeout(() => {
      setExpandedQuestion(formData.questions.length);
    }, 100);
  };

  const removeQuestion = (index) => {
    if (formData.questions.length <= 1) {
      setErrorMessage("Quiz must have at least one question");
      return;
    }

    setFormData((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions.splice(index, 1);
      return {
        ...prev,
        questions: updatedQuestions,
      };
    });

    if (expandedQuestion === index) {
      setExpandedQuestion(null);
    } else if (expandedQuestion > index) {
      setExpandedQuestion(expandedQuestion - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/faculty/quiz/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          _id: quiz._id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || "Quiz updated successfully!");
        // Wait a bit to show the success message before redirecting
        setTimeout(() => {
          onUpdate(
            data.quiz || { ...quiz, ...formData, updatedAt: new Date() }
          );
          onBack();
        }, 1500);
      } else {
        setErrorMessage(data.message || "Failed to update quiz");
      }
    } catch (error) {
      console.error("Error updating quiz:", error);
      setErrorMessage("An error occurred while updating the quiz");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto">
      {/* Back Button & Breadcrumb - Responsive */}
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-2 hover:bg-gray-100 p-2 h-auto"
          size="sm"
        >
          <ArrowLeft size={isMobile ? 16 : 18} className="mr-1 sm:mr-2" />
          <span className="text-xs sm:text-sm">Back to Quiz</span>
        </Button>

        {!isMobile && (
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2 text-xs sm:text-sm">
              <li className="inline-flex items-center">
                <span
                  className="font-medium text-gray-700 hover:text-gray-900 cursor-pointer"
                  onClick={() => onBack()}
                >
                  Quizzes
                </span>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRight size={12} className="text-gray-400" />
                  <span
                    className="ml-1 font-medium text-gray-700 hover:text-gray-900 cursor-pointer truncate max-w-32 sm:max-w-full"
                    onClick={onBack}
                  >
                    {quiz.title}
                  </span>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRight size={12} className="text-gray-400" />
                  <span className="ml-1 font-medium text-blue-600">Edit</span>
                </div>
              </li>
            </ol>
          </nav>
        )}
      </div>

      {/* Form Header - More compact on mobile */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-3 sm:p-5 md:p-6 mb-4 sm:mb-5 shadow-sm">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Edit Quiz
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-600">
          Update quiz details and questions
        </p>
      </div>

      {/* Alert Messages */}
      {errorMessage && (
        <div className="mb-3 p-2 sm:p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs sm:text-sm">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="mb-3 p-2 sm:p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs sm:text-sm">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="border-gray-200 mb-4 sm:mb-5 shadow-sm">
          <CardHeader className="bg-gray-50 py-2 px-3 sm:py-3 sm:px-4 border-b border-gray-200">
            <h3 className="text-sm sm:text-base font-semibold text-gray-800">
              Quiz Details
            </h3>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                >
                  Quiz Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="quiz_code"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                >
                  Quiz Code
                </label>
                <input
                  type="text"
                  id="quiz_code"
                  name="quiz_code"
                  value={formData.quiz_code}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="time"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                >
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                  min="1"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="syllabus"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                >
                  Syllabus Coverage
                </label>
                <textarea
                  id="syllabus"
                  name="syllabus"
                  value={formData.syllabus}
                  onChange={handleInputChange}
                  rows={isMobile ? "2" : "3"}
                  className="w-full p-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                ></textarea>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 mb-4 sm:mb-5 shadow-sm">
          <CardHeader className="bg-gray-50 py-2 px-3 sm:py-3 sm:px-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm sm:text-base font-semibold text-gray-800">
              Questions ({formData.questions.length})
            </h3>
            <Button
              type="button"
              onClick={addNewQuestion}
              size="sm"
              className="h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus size={isMobile ? 14 : 16} className="mr-1" />
              Add Question
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {formData.questions.map((question, qIndex) => (
              <div
                key={question._id || qIndex}
                className="border-b border-gray-100 last:border-0"
              >
                {/* Question Header - Always visible */}
                <div
                  className="p-2 sm:p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleQuestionExpand(qIndex)}
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-100 text-blue-700 font-semibold flex-shrink-0 text-xs">
                      {qIndex + 1}
                    </div>
                    <div className="ml-2 text-xs sm:text-sm font-medium truncate max-w-40 sm:max-w-xs md:max-w-md">
                      {question.question_text || "New question"}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    {expandedQuestion === qIndex ? (
                      <ChevronDown
                        size={isMobile ? 16 : 18}
                        className="text-blue-500"
                      />
                    ) : (
                      <ChevronRight
                        size={isMobile ? 16 : 18}
                        className="text-gray-400"
                      />
                    )}
                  </div>
                </div>

                {/* Question Content - Expandable */}
                {expandedQuestion === qIndex && (
                  <div className="p-3 pt-0 sm:p-4 sm:pt-0 bg-gray-50">
                    <div className="mt-3 space-y-3">
                      <div>
                        <label
                          htmlFor={`question-${qIndex}`}
                          className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                        >
                          Question Text
                        </label>
                        <textarea
                          id={`question-${qIndex}`}
                          value={question.question_text}
                          onChange={(e) =>
                            handleQuestionChange(
                              qIndex,
                              "question_text",
                              e.target.value
                            )
                          }
                          rows="2"
                          className="w-full p-2 border border-gray-300 rounded-md text-xs sm:text-sm mb-3"
                          required
                        ></textarea>
                      </div>

                      <div className="space-y-2 mb-3">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-700">
                          Options
                        </h4>
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className="flex items-center gap-2"
                          >
                            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-xs text-gray-700">
                              {String.fromCharCode(65 + optIndex)}
                            </div>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) =>
                                handleOptionChange(
                                  qIndex,
                                  optIndex,
                                  e.target.value
                                )
                              }
                              className="flex-1 p-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                              required
                            />
                            <input
                              type="radio"
                              id={`option-${qIndex}-${optIndex}`}
                              checked={option === question.correct_answer}
                              onChange={() =>
                                handleCorrectAnswerChange(qIndex, option)
                              }
                              className="ml-1"
                            />
                            <label
                              htmlFor={`option-${qIndex}-${optIndex}`}
                              className="text-xs text-gray-500 whitespace-nowrap"
                            >
                              {isMobile ? "" : "Correct"}
                            </label>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-gray-200">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => moveQuestionUp(qIndex)}
                          disabled={qIndex === 0}
                          className="p-1 h-7 w-7 text-xs"
                        >
                          <ChevronUp size={14} />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => moveQuestionDown(qIndex)}
                          disabled={qIndex === formData.questions.length - 1}
                          className="p-1 h-7 w-7 text-xs"
                        >
                          <ChevronDown size={14} />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeQuestion(qIndex)}
                          className="p-1 h-7 text-xs bg-red-50 border-red-200 hover:bg-red-100 text-red-600"
                        >
                          <Trash2 size={14} className="mr-1" />
                          {isMobile ? "" : "Remove"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {formData.questions.length === 0 && (
              <div className="p-8 text-center text-gray-500 text-sm">
                No questions added yet. Click "Add Question" to get started.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2 sm:space-x-3 sticky bottom-0 bg-white p-2 border-t border-gray-200 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="text-xs sm:text-sm h-8 sm:h-9"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm h-8 sm:h-9"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <span className="animate-spin mr-1 sm:mr-2">⟳</span>
                <span>{isMobile ? "Updating..." : "Updating Quiz..."}</span>
              </span>
            ) : (
              <span>{isMobile ? "Update Quiz" : "Update Quiz Details"}</span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditQuizView;

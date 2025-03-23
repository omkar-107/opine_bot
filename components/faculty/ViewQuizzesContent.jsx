import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Book,
  BookOpen,
  Calendar,
  CheckCircle,
  CheckSquare,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Filter,
  Search,
  User,
  XCircle,
} from "lucide-react";

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
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  // Track window size for responsive layouts
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // Determine if we're on mobile/tablet
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

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
        const response = await fetch(`/api/faculty/quiz/getall/${faculty_id}`);
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
        isMobile={isMobile}
        isTablet={isTablet}
      />
    );
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8 shadow-sm">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Quiz Management
        </h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
          View, manage and analyze your quizzes
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <Input
              placeholder={
                isMobile
                  ? "Search quizzes..."
                  : "Search quizzes by title, code or syllabus..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-2 sm:py-5 bg-white border-gray-200"
            />
          </div>
        </div>

        <Button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Filter size={18} />
          {!isMobile && "Filters"}
          <Badge className="ml-1 bg-blue-100 text-blue-700 hover:bg-blue-200">
            {activeFilter !== "all" ||
            courseFilter !== "all" ||
            sortBy !== "newest"
              ? "Active"
              : ""}
          </Badge>
        </Button>
      </div>

      {/* Expandable Filter Panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4 sm:mb-6 overflow-hidden"
          >
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                  <div>
                    <Label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 block">
                      Status
                    </Label>
                    <select
                      value={activeFilter}
                      onChange={(e) => setActiveFilter(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg bg-white text-sm"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 block">
                      Course
                    </Label>
                    <select
                      value={courseFilter}
                      onChange={(e) => setCourseFilter(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg bg-white text-sm"
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
                    <Label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 block">
                      Sort By
                    </Label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg bg-white text-sm"
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

      {/* Quiz Counter & Status Badges */}
      <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
        <p className="text-sm sm:text-base text-gray-500">
          {filteredQuizzes.length}
          {filteredQuizzes.length === 1 ? " quiz" : " quizzes"} found
        </p>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <Badge
            variant="outline"
            className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200 text-xs sm:text-sm"
          >
            <CheckCircle size={isMobile ? 12 : 14} />
            Active: {quizzes.filter((q) => q.active).length}
          </Badge>
          <Badge
            variant="outline"
            className="flex items-center gap-1 bg-gray-50 text-gray-700 border-gray-200 text-xs sm:text-sm"
          >
            <XCircle size={isMobile ? 12 : 14} />
            Inactive: {quizzes.filter((q) => !q.active).length}
          </Badge>
        </div>
      </div>

      {/* Quiz List */}
      {filteredQuizzes.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
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
                      className={`w-full h-1 sm:w-2 sm:h-auto ${
                        quiz.active ? "bg-green-500" : "bg-gray-300"
                      }`}
                    ></div>
                    <div className="flex-1 p-3 sm:p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <FileText
                              size={isMobile ? 16 : 18}
                              className="text-blue-600"
                            />
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mr-1">
                              {quiz.title}
                            </h3>
                            <Badge
                              variant={quiz.active ? "success" : "secondary"}
                              className={`text-xs ${
                                quiz.active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {quiz.active ? "Active" : "Inactive"}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-x-3 sm:gap-x-6 gap-y-1 sm:gap-y-2 mt-2">
                            <div className="flex items-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm">
                              <Calendar size={isMobile ? 12 : 14} />
                              <span>{formatDate(quiz.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm">
                              <Clock size={isMobile ? 12 : 14} />
                              <span>{quiz.time} minutes</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm">
                              <BookOpen size={isMobile ? 12 : 14} />
                              <span>{quiz.num_questions} questions</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm">
                              <Book size={isMobile ? 12 : 14} />
                              <span>Course: {quiz.course_id}</span>
                            </div>
                          </div>

                          {quiz.syllabus && (
                            <p className="text-xs sm:text-sm text-gray-500 mt-2 line-clamp-1">
                              <span className="font-medium">Topics:</span>{" "}
                              {quiz.syllabus}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-2 md:mt-0">
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 text-xs"
                          >
                            <Eye size={isMobile ? 12 : 14} />
                            {quiz.responses.length} responses
                          </Badge>
                          <ChevronRight
                            size={isMobile ? 16 : 20}
                            className="text-gray-400"
                          />
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
          <CardContent className="p-6 sm:p-8 md:p-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <AlertTriangle
                size={isMobile ? 32 : 48}
                className="text-gray-300"
              />
              <h3 className="text-lg sm:text-xl font-medium text-gray-700">
                No quizzes found
              </h3>
              <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
                No quizzes match your current filters. Try adjusting your search
                or filter criteria.
              </p>
              <Button
                variant="outline"
                onClick={resetFilters}
                className="mt-2 sm:mt-4"
              >
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const QuizDetailView = ({ quiz, onBack, isMobile, isTablet }) => {
  const [activeTab, setActiveTab] = useState("questions");

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto">
      {/* Back Button & Breadcrumb */}
      <div className="mb-4 sm:mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-2 hover:bg-gray-100"
        >
          <ArrowLeft size={isMobile ? 14 : 16} className="mr-2" />
          Back to Quizzes
        </Button>

        {!isMobile && (
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
        )}
      </div>

      {/* Quiz Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0">
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {quiz.title}
              </h1>
              <Badge
                variant={quiz.active ? "success" : "secondary"}
                className={`text-xs sm:text-sm ${
                  quiz.active
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {quiz.active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-gray-600">
              Quiz Code:{" "}
              <span className="font-mono font-medium">{quiz.quiz_code}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Button className="w-full text-xs sm:text-sm bg-blue-500 hover:bg-blue-600 text-white">
              {quiz.active ? "Deactivate Quiz" : "Activate Quiz"}
            </Button>
            <Button variant="outline" className="w-full text-xs sm:text-sm">
              Edit Quiz
            </Button>
          </div>
        </div>
      </div>

      {/* Quiz Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-3 mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <Clock size={isMobile ? 16 : 20} className="text-blue-700" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
                  Duration
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {quiz.time} minutes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-3 mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                <BookOpen
                  size={isMobile ? 16 : 20}
                  className="text-purple-700"
                />
              </div>
              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
                  Questions
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {quiz.num_questions} total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 sm:col-span-2 md:col-span-1">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-3 mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <User size={isMobile ? 16 : 20} className="text-green-700" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
                  Responses
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {quiz.responses.length} received
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Tabs Selector */}
      {isMobile && (
        <div className="mb-4">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-white"
          >
            <option value="questions">Questions</option>
            <option value="details">Quiz Details</option>
            <option value="responses">Responses</option>
          </select>
        </div>
      )}

      {/* Desktop/Tablet Tabs */}
      {!isMobile && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 sm:mb-6">
            <TabsTrigger value="questions" className="text-xs sm:text-sm">
              Questions
            </TabsTrigger>
            <TabsTrigger value="details" className="text-xs sm:text-sm">
              Quiz Details
            </TabsTrigger>
            <TabsTrigger value="responses" className="text-xs sm:text-sm">
              Responses
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Questions Tab Content */}
      {activeTab === "questions" && (
        <Card className="border-gray-200">
          <CardHeader className="bg-gray-50 py-3 px-4 sm:py-4 sm:px-6 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              Quiz Questions
            </h3>
          </CardHeader>
          <CardContent className="p-0">
            {quiz.questions.map((question, index) => (
              <div
                key={question._id}
                className="border-b border-gray-100 last:border-0"
              >
                <div className="p-3 sm:p-4 md:p-6">
                  <div className="flex gap-2 sm:gap-4">
                    <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-100 text-blue-700 font-semibold flex-shrink-0 text-xs sm:text-sm">
                      {index + 1}
                    </div>
                    <div className="space-y-2 sm:space-y-4 flex-1">
                      <h4 className="text-sm sm:text-base font-medium text-gray-800">
                        {question.question_text}
                      </h4>

                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`p-2 sm:p-3 rounded-lg flex items-start gap-2 sm:gap-3 ${
                              option === question.correct_answer
                                ? "bg-green-50 border border-green-200"
                                : "bg-gray-50 border border-gray-200"
                            }`}
                          >
                            <div
                              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                                option === question.correct_answer
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {String.fromCharCode(65 + optIndex)}
                            </div>
                            <div className="flex-1">
                              <p
                                className={`text-xs sm:text-sm ${
                                  option === question.correct_answer
                                    ? "text-green-800"
                                    : "text-gray-700"
                                }`}
                              >
                                {option}
                              </p>
                            </div>
                            {option === question.correct_answer && (
                              <CheckSquare
                                size={isMobile ? 14 : 18}
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
      )}

      {/* Details Tab Content */}
      {activeTab === "details" && (
        <Card className="border-gray-200">
          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">
                Quiz Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-500">Course ID</p>
                  <p className="text-xs sm:text-sm font-medium">
                    {quiz.course_id}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-500">Created By</p>
                  <p className="text-xs sm:text-sm font-medium">
                    {quiz.created_by}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-500">Created On</p>
                  <p className="text-xs sm:text-sm font-medium">
                    {new Date(quiz.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-500">
                    Last Updated
                  </p>
                  <p className="text-xs sm:text-sm font-medium">
                    {new Date(quiz.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {quiz.syllabus && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">
                  Syllabus Coverage
                </h3>
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-blue-800">
                    {quiz.syllabus}
                  </p>
                </div>
              </div>
            )}

            <Separator />

            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">
                Status Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-500">Status</p>
                  <Badge
                    variant={quiz.active ? "success" : "secondary"}
                    className={`text-xs ${
                      quiz.active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {quiz.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-500">Started On</p>
                  <p className="text-xs sm:text-sm font-medium">
                    {quiz.started_on
                      ? new Date(quiz.started_on).toLocaleString()
                      : "Not started yet"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-500">Ended On</p>
                  <p className="text-xs sm:text-sm font-medium">
                    {quiz.ended_on
                      ? new Date(quiz.ended_on).toLocaleString()
                      : "Not ended yet"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Responses Tab Content */}
      {activeTab === "responses" && (
        <Card className="border-gray-200">
          <CardContent className="p-4 sm:p-6">
            {quiz.responses.length > 0 ? (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-6">
                  Student Responses
                </h3>
                <p className="text-xs sm:text-sm">
                  Response details will be displayed here
                </p>
              </div>
            ) : (
              <div className="text-center py-6 sm:py-10 md:py-12">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3 sm:mb-4">
                  <AlertTriangle
                    size={isMobile ? 16 : 24}
                    className="text-gray-400"
                  />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-1 sm:mb-2">
                  No Responses Yet
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                  This quiz hasn't received any responses yet. Responses will
                  appear here once students complete the quiz.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ViewQuizzesContent;

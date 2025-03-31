import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Book,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Filter,
  Search,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import QuizDetailView from "@/components/faculty/viewquizzescomponents/QuizDetailView";

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
      if (selectedQuiz === null) setLoading(true);
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
          const courses = Array.from(
            new Map(
              data.map((quiz) => [
                quiz.course_id,
                { cid: quiz.course_id, cname: quiz.course_name },
              ])
            ).values()
          );
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
  }, [userobj.username, selectedQuiz]);

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
    return <LoadingSpinner message="Hey, hold on please ..." />;
  }

  if (selectedQuiz) {
    return (
      <QuizDetailView
        quiz={selectedQuiz}
        onBack={() => setSelectedQuiz(null)}
        isMobile={isMobile}
        isTablet={isTablet}
        userobj={userobj}
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
                        <option key={course.cid} value={course.cid}>
                          {course.cname}
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
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 sm:gap-3">
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
                              <span>Course: {quiz.course_name}</span>
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

export default ViewQuizzesContent;

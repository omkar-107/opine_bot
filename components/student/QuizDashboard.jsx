import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { MutatingDots } from "react-loader-spinner";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Clock,
  Filter,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import QuizCode from "@/components/student/QuizCodeEntry";


const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="h-64 w-full flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4 p-8 rounded-lg">
        {/* <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div> */}
        <MutatingDots
          visible={true}
          height="100"
          width="100"
          color="#1d4ed8"
          secondaryColor="#1d4ed8"
          radius="12.5"
          ariaLabel="mutating-dots-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

const QuizDashboard = ({ userobj }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("course");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [coursesFilter, setCoursesFilter] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("all");
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
      setLoading(true);
      try {
        const response = await fetch(
          `/api/student/quiz/myquizzes/${userobj.email}`
        );
        if (response.ok) {
          const data = await response.json();

          if (data.quizzes && data.quizzes.length > 0) {
            setQuizzes(data.quizzes);
            setFilteredQuizzes(data.quizzes);

            // Extract unique courses for filtering
            const uniqueCourses = Array.from(
              new Set(data.quizzes.map((quiz) => quiz.course_id))
            ).map((courseId) => {
              const quiz = data.quizzes.find((q) => q.course_id === courseId);
              return {
                id: courseId,
                name: quiz.course_name,
              };
            });

            setCoursesFilter(uniqueCourses);
          } else {
            setQuizzes([]);
            setFilteredQuizzes([]);
          }
        } else {
          console.error("Failed to fetch quizzes");
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userobj) {
      fetchQuizzes();
    }
  }, [userobj]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, sortBy, selectedCourse, quizzes]);

  const applyFilters = () => {
    let filtered = [...quizzes];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.course_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply course filter
    if (selectedCourse !== "all") {
      filtered = filtered.filter((quiz) => quiz.course_id === selectedCourse);
    }

    // Apply sorting
    filtered = sortQuizzes(filtered, sortBy);

    setFilteredQuizzes(filtered);
  };

  const sortQuizzes = (quizList, sortMethod) => {
    switch (sortMethod) {
      case "title":
        return [...quizList].sort((a, b) => a.title.localeCompare(b.title));
      case "course":
        return [...quizList].sort((a, b) =>
          a.course_name.localeCompare(b.course_name)
        );
      case "duration":
        return [...quizList].sort((a, b) => b.time - a.time);
      case "questions":
        return [...quizList].sort((a, b) => b.num_questions - a.num_questions);
      default:
        return quizList;
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCourse("all");
    setSortBy("course");
  };

  const handleQuizStart = (quizId) => {
    // Navigate to quiz page or handle quiz start logic
    console.log(`Starting quiz: ${quizId}`);
    // <QuizCode quizId = {quizId}/>
    window.open(`${window.location.origin}/quiz/${quizId}/check`, "_blank");
    // window.location.href = `/student/quiz/${quizId}`;
  };

  if (loading) {
    return <LoadingSpinner message="Loading your quizzes..." />;
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8 shadow-sm">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          My Quizzes
        </h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
          View and attempt your active quizzes
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
                  : "Search by quiz title or course..."
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
            {selectedCourse !== "all" || sortBy !== "course" ? "Active" : ""}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 block">
                      Course
                    </label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg bg-white text-sm"
                    >
                      <option value="all">All Courses</option>
                      {coursesFilter.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 block">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg bg-white text-sm"
                    >
                      <option value="course">Course Name</option>
                      <option value="title">Quiz Title</option>
                      <option value="duration">Duration</option>
                      <option value="questions">Number of Questions</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 flex items-end">
                    <Button
                      onClick={resetFilters}
                      variant="outline"
                      className="w-full sm:w-auto"
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

      {/* Quiz Counter */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm sm:text-base text-gray-500">
          {filteredQuizzes.length}
          {filteredQuizzes.length === 1 ? " quiz" : " quizzes"} available
        </p>
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
              <Card className="hover:shadow-md transition-all duration-300 border-gray-200 overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className="w-full h-1 sm:w-2 sm:h-auto bg-blue-500"></div>
                    <div className="flex-1 p-3 sm:p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 sm:gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mr-1">
                              {quiz.title}
                            </h3>
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              {quiz.active ? "Active" : "Inactive"}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-x-3 sm:gap-x-6 gap-y-1 sm:gap-y-2 mt-2">
                            <div className="flex items-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm">
                              <BookOpen size={isMobile ? 12 : 14} />
                              <span>{quiz.course_name}</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm">
                              <Clock size={isMobile ? 12 : 14} />
                              <span>{quiz.time} minutes</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm">
                              <CheckCircle size={isMobile ? 12 : 14} />
                              <span>{quiz.num_questions} questions</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end mt-3 md:mt-0">
                          <Button
                            onClick={() => handleQuizStart(quiz._id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-300 w-full md:w-auto"
                          >
                            <span>Start Quiz</span>
                            <ChevronRight size={isMobile ? 16 : 18} />
                          </Button>
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
                {searchTerm || selectedCourse !== "all"
                  ? "No quizzes match your current filters. Try adjusting your search or filter criteria."
                  : "There are no active quizzes available for you at this time."}
              </p>
              {(searchTerm || selectedCourse !== "all") && (
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="mt-2 sm:mt-4"
                >
                  Reset Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuizDashboard;

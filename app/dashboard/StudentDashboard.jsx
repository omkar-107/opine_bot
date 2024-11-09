import React, { useState, useEffect} from "react";
import Image from "next/image";
import Logout from "@/public/assets/Logout.svg";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import Emoji from "@/public/assets/Reaction.png";
import { Bars, FallingLines, BallTriangle } from "react-loader-spinner";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";


import {
  Shield,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Send,
  Briefcase,
  GraduationCap,
  Languages,
  Award,
  Heart,
  Music,
  Camera,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  FileEdit,
  FileSearch,
  User,
  LogOut,
  History,
  UserCircle,Loader2, CheckCircle, AlertCircle,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card, CardContent} from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

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

const LoadingSpinner = ({ type = "bars", message = "Loading..." }) => {
  return (
    <div className="h-[calc(100vh-theme(spacing.16))] flex flex-col items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        {type === "bars" ? (
          <Bars
            height="80"
            width="80"
            color="#7b61ff"
            ariaLabel="loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        ) : (
          <BallTriangle
            height={100}
            width={100}
            radius={5}
            color="#7b61ff"
            ariaLabel="loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        )}
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

const DashboardContent = ({ userobj }) => {
  const [feedbackTasks, setFeedbackTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const fetchFeedbackTasks = async () => {
      try {
        const response = await fetch(
          `/api/student/gettasks/${userobj.username}`
        );
        if (response.ok) {
          const data = await response.json();
          setFeedbackTasks(data);
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
  }, [userobj.username]);

  if (loading) {
    return (
      <LoadingSpinner message="Hold on tight, loading your dashboard..." />
    );
  }

  const handleFeedbackButton = async ({ _id, course_id, created_by }) => {
    const response = await fetch(`/api/student/myfeedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task_id: _id,
        given_by: userobj.username,
        for_course: course_id,
        faculty: created_by,
      }),
    });
    const data = await response.json();
    console.log(data.feedbackId);

    if (response.ok) {
      window.open("http://localhost:3000/chat/" + data.feedbackId, "_blank");
    } else {
      alert("Error opening feedback page. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="mt-4 text-gray-600 text-lg">
            Welcome to your dashboard! Here, you will see an overview of your activities and updates.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">
            Outstanding Feedbacks
          </h3>
          
          {feedbackTasks.length > 0 ? (
            <div className="space-y-4 overflow-y-auto max-h-[30rem] pr-2">
              {feedbackTasks.map((task, index) => (
                <Card
                  key={index}
                  className={`transform transition-all duration-300 ease-in-out ${
                    hoveredCard === index ? 'scale-[1.02]' : ''
                  }`}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xl font-bold text-gray-800">
                            {task.title}
                          </h4>
                          {task.active ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                        
                        <div className="mt-2 space-y-1">
                          <p className="text-gray-600">
                            Course ID: <span className="font-semibold">{task.course_id}</span>
                          </p>
                          <p className="text-gray-600">
                            Created by: <span className="font-semibold">{task.created_by}</span>
                          </p>
                        </div>
                        
                        <div className="mt-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              task.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {task.active ? 'Active' : 'Closed'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (task.active) {
                            handleFeedbackButton({
                              _id: task._id,
                              course_id: task.course_id,
                              created_by: task.created_by,
                            });
                          }
                        }}
                        className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                          task.active
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                            : 'bg-gray-100 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        {task.active ? 'Complete feedback now' : 'View feedback'}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No outstanding feedback tasks available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const ProfileContent = ({ userobj }) => {
  const [courses, setCourses] = useState([]);
  const [userDetailsObj, setUserDetailsObj] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState(userobj?.email);
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [passwordMatch, setPasswordMatch] = useState(true);

  useEffect(() => {
    (async () => {
      const response = await fetch("/api/student/getcourses/" + userobj.username);
      const courses_backend = await response.json();
      setCourses(courses_backend.student_courses);
    })();
  }, [userobj.username]);

  useEffect(() => {
    (async () => {
      const response = await fetch("/api/student/getdetails/" + userobj.username);
      const userdetails_backend = await response.json();
      setUserDetailsObj(userdetails_backend);
      setLoading(false);
    })();
  }, [userobj.username]);

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    const newPassword = event.target.newPassword.value;
    const confirmPassword = event.target.confirmPassword.value;
    
    if (newPassword !== confirmPassword) {
      setPasswordMatch(false);
      return;
    }
    
    setPasswordMatch(true);
    setIsEditing(false);
    // API call would go here
  };

  if (loading) {
    return (
      <LoadingSpinner message="loading your profile..." />
    );
  }

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
           My Profile
          </h2>
          <Button
            variant="outline"
            className="relative overflow-hidden group bg-white border-2 border-purple-500 hover:border-purple-600 text-purple-600 hover:text-purple-700 px-6 py-2 rounded-lg transition-all duration-300"
            onClick={() => setIsEditing(!isEditing)}
          >
            <span className="relative z-10">
              {isEditing ? "Cancel" : "Edit Profile"}
            </span>
            <div className="absolute inset-0 bg-purple-100 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
          </Button>
        </div>

        <Card className="relative overflow-hidden bg-white rounded-2xl shadow-xl">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-purple-100 to-transparent opacity-50" />
          
          <div className="relative p-8">
            {/* Student Header Section */}
            <div className="relative mb-8 pb-6 border-b border-purple-100">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                    <GraduationCap className="w-12 h-12 text-white" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 text-sm font-medium text-purple-700 bg-purple-100 rounded-full">
                      Student ID
                    </span>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {userobj?.username}
                    </h2>
                  </div>
                  <div className="flex items-center gap-6 text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-purple-500" />
                      <span>{userDetailsObj.branch || "Dept"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      <span>
                        Year {userDetailsObj.year || "Year"} • Semester{" "}
                        {userDetailsObj.semester || "Sem"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Details Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                <BookOpen className="w-5 h-5 text-purple-600" />
                Current Courses
              </h3>
              <div className="flex flex-wrap gap-3">
                {courses && courses.length > 0 ? (
                  courses.map((course, index) => (
                    <div
                      key={index}
                      className={`px-4 py-3 rounded-lg transform transition-all duration-300 cursor-pointer ${
                        hoveredCourse === index
                          ? 'scale-105 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                          : 'bg-gradient-to-r from-purple-50 to-blue-50 text-gray-800'
                      }`}
                      onMouseEnter={() => setHoveredCourse(index)}
                      onMouseLeave={() => setHoveredCourse(null)}
                    >
                      <span className="text-sm font-semibold">{course}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">No courses found</div>
                )}
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-purple-600" />
                      Personal Details
                    </h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={userDetailsObj.email || "Email_"}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-purple-600" />
                      Security
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Current Password
                        </label>
                        <Input
                          type="password"
                          name="currentPassword"
                          required
                          className="mt-1 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          New Password
                        </label>
                        <Input
                          type="password"
                          name="newPassword"
                          required
                          className="mt-1 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Confirm Password
                        </label>
                        <Input
                          type="password"
                          name="confirmPassword"
                          required
                          className="mt-1 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {!passwordMatch && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Passwords do not match. Please try again.
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl text-white transform hover:scale-[1.02] transition-all duration-300"
                >
                  Save Changes
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                  <Mail className="w-5 h-5 text-purple-600" />
                  Contact Information
                </h3>
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-600">
                    Email Address
                  </label>
                  <p className="text-gray-800 font-medium mt-1">{email}</p>
                </div>
              </div>
            )}

            <Alert className="mt-6 border-l-4 border-red-500 bg-red-50">
              <AlertDescription className="text-sm text-red-700">
                <span className="font-medium">Note:</span> Please contact your
                department admin for any queries related to your details
              </AlertDescription>
            </Alert>
          </div>
        </Card>
      </div>
      </div>
  );
}
const FeedbackHistoryContent = (userobj) => {
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState("range");
  const [selectedDate, setSelectedDate] = useState(null);
  const itemsPerPage = 6;

  const fetchFeedbackHistory = async () => {
    console.log("called");
    try {
      const user = await getUser();
      console.log("user in history is", user.user.user.username);
      const response = await fetch(
        `/api/student/completedfeedbacks/${user.user.user.username}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch feedback history");
      }

      const data = await response.json();
      console.log("this is called", data.feedbacks);
      setFeedbackHistory(data.feedbacks);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching feedback history:", error);
    }
  };
  useEffect(() => {
    fetchFeedbackHistory();
  }, []);

  const clearDateFilters = () => {
    setDateRange({ from: null, to: null });
    setSelectedDate(null);
  };

  const filteredFeedback = feedbackHistory.filter((item) => {
    const matchesSearch =
      item.task_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.for_course.toLowerCase().includes(searchQuery.toLowerCase());

    const itemDate = new Date(item.completedAt);

    let matchesDate = true;
    if (filterType === "range" && (dateRange.from || dateRange.to)) {
      matchesDate =
        (!dateRange.from || itemDate >= dateRange.from) &&
        (!dateRange.to || itemDate <= dateRange.to);
    } else if (filterType === "single" && selectedDate) {
      matchesDate = itemDate.toDateString() === selectedDate.toDateString();
    }

    return matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredFeedback.length / itemsPerPage);
  const paginatedFeedback = filteredFeedback.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <LoadingSpinner message="Hold on tight, loading your dashboard..." />
    );
  }

  return (
    <div className="min-h-screen w-full px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Feedback History
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          View all your past feedback and track your progress over time
        </p>

        <Card className="w-full p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search feedbacks or courses..."
                  className="pl-10 pr-4 py-2 w-full border-2 focus:ring-2 focus:ring-blue-500 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <Select
                  value={filterType}
                  onValueChange={(value) => {
                    setFilterType(value);
                    clearDateFilters();
                  }}
                >
                  <SelectTrigger className="w-[180px] border-2 hover:border-blue-400 transition-colors">
                    <SelectValue placeholder="Filter by date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Date</SelectItem>
                    <SelectItem value="range">Date Range</SelectItem>
                  </SelectContent>
                </Select>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" 
                      className="flex items-center gap-2 border-2 hover:border-blue-400 hover:bg-blue-50 transition-all">
                      <Calendar size={20} className="text-blue-600" />
                      {filterType === "range"
                        ? dateRange.from
                          ? dateRange.from.toLocaleDateString()
                          : "Select dates"
                        : selectedDate
                        ? selectedDate.toLocaleDateString()
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <CalendarComponent
                      mode={filterType === "range" ? "range" : "single"}
                      selected={filterType === "range" ? dateRange : selectedDate}
                      onSelect={
                        filterType === "range"
                          ? (range) => setDateRange(range || { from: null, to: null })
                          : (date) => setSelectedDate(date)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {(dateRange.from || selectedDate) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearDateFilters}
                    className="h-9 w-9 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <X size={20} />
                  </Button>
                )}
              </div>
            </div>
            {(dateRange.from || selectedDate) && (
              <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded-md inline-flex items-center">
                <Calendar size={16} className="mr-2" />
                {filterType === "range"
                  ? `Showing results from ${dateRange.from?.toLocaleDateString()} to ${
                      dateRange.to?.toLocaleDateString() || "present"
                    }`
                  : `Showing results for ${selectedDate.toLocaleDateString()}`}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {paginatedFeedback.length > 0 ? (
              paginatedFeedback.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-6 rounded-xl bg-gradient-to-r from-white to-blue-50 border border-blue-100 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {item.task_title.charAt(0)}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">
                      {item.task_title}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-700">Course ID:</span>{" "}
                          {item.for_course}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-700">Created by:</span>{" "}
                          {item.faculty}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-700">Completed:</span>{" "}
                          {new Date(item.completedAt).toLocaleString()}
                        </p>
                        <div className="mt-2">
                          <span className="px-4 py-1 bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-full text-sm font-medium">
                            {item.completed ? "Completed" : "Processing"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-gray-500 space-y-2">
                  <Search size={48} className="mx-auto text-gray-400" />
                  <p className="text-lg">No feedback found for the selected filters</p>
                  <p className="text-sm">Try adjusting your search or date filters</p>
                </div>
              </div>
            )}
          </div>

          {paginatedFeedback.length > 0 && (
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="border-2 hover:border-blue-400 hover:bg-blue-50 transition-all disabled:opacity-50"
              >
                Previous
              </Button>
              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 p-0 border-2 ${
                      currentPage === i + 1
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                        : "hover:border-blue-400 hover:bg-blue-50"
                    } transition-all`}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="border-2 hover:border-blue-400 hover:bg-blue-50 transition-all disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [userobj, setUserObj] = useState({});
  const router = useRouter();
  const [logoutActive, setLogoutActive] = useState(true);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    (async () => {
      const { user, error } = await getUser();
      user ? setUserObj(user.user) : router.push("/login");
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

  const tabs = [
    {
      name: "Dashboard",
      component: <DashboardContent userobj={userobj} />,
      icon: LayoutDashboard,
      active: activeTab === "Dashboard",
    },
    {
      name: "Profile",
      component: <ProfileContent userobj={userobj} />,
      icon: UserCircle,
      active: activeTab === "Profile",
    },
    {
      name: "Feedback History",
      component: <FeedbackHistoryContent userobj={userobj} />,
      icon: History,
      active: activeTab === "Feedback History",
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return <DashboardContent userobj={userobj} />;
      case "Profile":
        return <ProfileContent userobj={userobj} />;
      case "Feedback History":
        return <FeedbackHistoryContent userobj={userobj} />;
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
                Student Dashboard
              </motion.h2>
            )}
          </AnimatePresence>
          <div className="absolute top-1/2 -translate-y-1/2 -right-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuExpanded(!isMenuExpanded)}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center shadow-md"
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
          <AnimatePresence>
            {isMenuExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <h3 className="font-semibold">
                  {userobj?.username || "Student"}
                </h3>
                <h3 className="font-semibold">{userobj?.email || "Student"}</h3>
                <p className="text-sm text-gray-500">Student</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator className="my-4" />

        <nav className="space-y-2 px-3">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
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
                <IconComponent className="mr-3" size={20} />
                {isMenuExpanded && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm"
                  >
                    {tab.name}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
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

export default StudentDashboard;

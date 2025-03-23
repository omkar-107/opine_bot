import React, { useState, useEffect } from "react";
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
  X,Menu,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  FileEdit,
  FileSearch,
  User,
  LogOut,
  History,
  UserCircle,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
      window.open(
        `${window.location.origin}/chat/` + data.feedbackId,
        "_blank"
      );
    } else {
      alert("Error opening feedback page. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br p-3 sm:p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg md:rounded-2xl shadow-md md:shadow-xl p-4 md:p-8 mb-4 md:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="mt-2 md:mt-4 text-gray-600 text-sm sm:text-base md:text-lg">
            Welcome to your dashboard! Here, you will see an overview of your
            activities and updates.
          </p>
        </div>

        <div className="bg-white rounded-lg md:rounded-2xl shadow-md md:shadow-xl p-4 md:p-8">
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-3 md:mb-6">
            Outstanding Feedbacks
          </h3>

          {feedbackTasks.length > 0 ? (
            <div className="space-y-3 md:space-y-4 overflow-y-auto max-h-[50vh] sm:max-h-[40vh] md:max-h-[30rem] pr-1 md:pr-2">
              {feedbackTasks.map((task, index) => (
                <Card
                  key={index}
                  className={`transform transition-all duration-300 ease-in-out ${
                    hoveredCard === index ? "scale-[1.02]" : ""
                  }`}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 truncate">
                            {task.title}
                          </h4>
                          {task.active ? (
                            <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-500 flex-shrink-0" />
                          )}
                        </div>

                        <div className="mt-1 md:mt-2 space-y-1">
                          <p className="text-xs sm:text-sm md:text-base text-gray-600">
                            Course ID:{" "}
                            <span className="font-semibold">
                              {task.course_id}
                            </span>
                          </p>
                          <p className="text-xs sm:text-sm md:text-base text-gray-600">
                            Created by:{" "}
                            <span className="font-semibold">
                              {task.created_by}
                            </span>
                          </p>
                        </div>

                        <div className="mt-2 md:mt-3">
                          <span
                            className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-medium ${
                              task.active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {task.active ? "Active" : "Closed"}
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
                        className={`mt-2 sm:mt-0 w-full sm:w-auto px-4 sm:px-5 md:px-6 py-2 md:py-3 rounded-md md:rounded-lg text-sm md:text-base font-medium transition-all duration-300 ${
                          task.active
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md md:shadow-lg hover:shadow-lg md:hover:shadow-xl"
                            : "bg-gray-100 text-gray-600 cursor-not-allowed"
                        }`}
                      >
                        {task.active
                          ? "Complete feedback"
                          : "View feedback"}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 md:py-12">
              <p className="text-gray-500 text-sm sm:text-base md:text-lg">
                No outstanding feedback tasks available.
              </p>
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
      const response = await fetch(
        "/api/student/getcourses/" + userobj.username
      );
      const courses_backend = await response.json();
      setCourses(courses_backend.student_courses);
    })();
  }, [userobj.username]);

  useEffect(() => {
    (async () => {
      const response = await fetch(
        "/api/student/getdetails/" + userobj.username
      );
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
    return <LoadingSpinner message="Loading your profile..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            My Profile
          </h2>
          <Button
            variant="outline"
            className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-4 sm:px-6 py-1 sm:py-2 rounded-lg transition-all duration-300"
            onClick={() => setIsEditing(!isEditing)}
          >
            <span className="text-sm sm:text-base">
              {isEditing ? "Cancel" : "Edit Profile"}
            </span>
          </Button>
        </div>

        <Card className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-md sm:shadow-lg md:shadow-xl">
          <div className="p-4 sm:p-6 md:p-8">
            {/* Student Header Section */}
            <div className="mb-6 md:mb-8 pb-4 md:pb-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <div className="relative mx-auto sm:mx-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-blue-600 text-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-md">
                    <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 rounded-full inline-block mx-auto sm:mx-0">
                      Student ID
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                      {userobj?.username}
                    </h2>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-sm sm:text-base text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span>{userDetailsObj.branch || "Dept"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
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
            <div className="mb-6 md:mb-8">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-gray-800">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Current Courses
              </h3>
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start">
                {courses && courses.length > 0 ? (
                  courses.map((course, index) => (
                    <div
                      key={index}
                      className={`px-3 sm:px-4 py-2 sm:py-3 rounded-md sm:rounded-lg transition-all duration-300 cursor-pointer text-center ${
                        hoveredCourse === index
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-blue-50 text-gray-800 hover:bg-blue-100"
                      }`}
                      onMouseEnter={() => setHoveredCourse(index)}
                      onMouseLeave={() => setHoveredCourse(null)}
                    >
                      <span className="text-xs sm:text-sm font-semibold">{course}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm sm:text-base w-full text-center sm:text-left">No courses found</div>
                )}
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-6 sm:space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      Personal Details
                    </h3>
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-gray-600">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={userDetailsObj.email || "Email_"}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border-gray-300 focus:border-blue-600 focus:ring-blue-600 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      Security
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-600">
                          Current Password
                        </label>
                        <Input
                          type="password"
                          name="currentPassword"
                          required
                          className="mt-1 border-gray-300 focus:border-blue-600 focus:ring-blue-600 text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-600">
                          New Password
                        </label>
                        <Input
                          type="password"
                          name="newPassword"
                          required
                          className="mt-1 border-gray-300 focus:border-blue-600 focus:ring-blue-600 text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-600">
                          Confirm Password
                        </label>
                        <Input
                          type="password"
                          name="confirmPassword"
                          required
                          className="mt-1 border-gray-300 focus:border-blue-600 focus:ring-blue-600 text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {!passwordMatch && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs sm:text-sm">
                      Passwords do not match. Please try again.
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300 py-2 text-sm sm:text-base"
                >
                  Save Changes
                </Button>
              </form>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 text-gray-800">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  Contact Information
                </h3>
                <div className="bg-gray-50 rounded-md sm:rounded-lg p-3 sm:p-4 border border-gray-200">
                  <label className="text-xs sm:text-sm font-medium text-gray-600">
                    Email Address
                  </label>
                  <p className="text-sm sm:text-base text-gray-800 font-medium mt-1">{email}</p>
                </div>
              </div>
            )}

            <Alert className="mt-4 sm:mt-6 border-l-4 border-blue-600 bg-blue-50">
              <AlertDescription className="text-xs sm:text-sm text-gray-700">
                <span className="font-medium">Note:</span> Please contact your
                department admin for any queries related to your details
              </AlertDescription>
            </Alert>
          </div>
        </Card>
      </div>
    </div>
  );
};


const FeedbackHistoryContent = () => {
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState("range");
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const itemsPerPage = 6;

  const fetchFeedbackHistory = async () => {
    try {
      const user = await getUser();
      const response = await fetch(
        `/api/student/completedfeedbacks/${user.user.user.username}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch feedback history");
      }

      const data = await response.json();
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

  const handleDateSelection = (date) => {
    if (filterType === "single") {
      setSelectedDate(date);
    } else {
      // Handle range selection
      if (!dateRange.from || (dateRange.from && dateRange.to)) {
        setDateRange({ from: date, to: null });
      } else {
        if (date < dateRange.from) {
          setDateRange({ from: date, to: dateRange.from });
        } else {
          setDateRange({ from: dateRange.from, to: date });
        }
      }
    }
  };

  // Simple DatePicker component
  const DatePicker = ({ onSelect, onClose, mode, selected }) => {
    const [viewDate, setViewDate] = useState(new Date());
    const [hoveredDate, setHoveredDate] = useState(null);
    
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
    
    const changeMonth = (delta) => {
      const newDate = new Date(viewDate);
      newDate.setMonth(newDate.getMonth() + delta);
      setViewDate(newDate);
    };
    
    const isSelected = (date) => {
      if (mode === "single" && selected) {
        return date.toDateString() === selected.toDateString();
      } else if (mode === "range") {
        return (
          (selected.from && date.toDateString() === selected.from.toDateString()) ||
          (selected.to && date.toDateString() === selected.to.toDateString())
        );
      }
      return false;
    };
    
    const isInRange = (date) => {
      if (mode === "range" && selected.from && !selected.to && hoveredDate) {
        return (
          (date > selected.from && date < hoveredDate) ||
          (date < selected.from && date > hoveredDate)
        );
      } else if (mode === "range" && selected.from && selected.to) {
        return date > selected.from && date < selected.to;
      }
      return false;
    };
    
    const handleMouseEnter = (date) => {
      if (mode === "range" && selected.from && !selected.to) {
        setHoveredDate(date);
      }
    };
    
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysCount = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    
    const days = [];
    // Previous month days
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    // Current month days
    for (let i = 1; i <= daysCount; i++) {
      days.push(new Date(year, month, i));
    }
    
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-72">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => changeMonth(-1)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <div className="font-medium">
            {months[month]} {year}
          </div>
          <button 
            onClick={() => changeMonth(1)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
            <div key={day} className="text-xs font-medium text-gray-500">{day}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => (
            <div key={index} className="h-8 flex items-center justify-center">
              {date ? (
                <button
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm
                    ${isSelected(date) ? 'bg-indigo-600 text-white' : 
                      isInRange(date) ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-gray-100'}`}
                  onClick={() => onSelect(date)}
                  onMouseEnter={() => handleMouseEnter(date)}
                >
                  {date.getDate()}
                </button>
              ) : (
                <span className="text-gray-300 text-sm">{""}</span>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex justify-between border-t pt-3">
          <button 
            onClick={() => {
              clearDateFilters();
              onClose();
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
          <button 
            onClick={onClose}
            className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700"
          >
            Done
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-indigo-800 font-medium">Loading your feedback history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-indigo-800">
          Feedback History
        </h1>
        <p className="text-gray-600 mb-8 text-base sm:text-lg">
          Track your progress and review past feedback
        </p>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          {/* Search and Filter Section */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md w-full">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search feedbacks or courses..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Date Filters */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    clearDateFilters();
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <option value="single">Single Date</option>
                  <option value="range">Date Range</option>
                </select>

                <div className="relative">
                  <button
                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    {filterType === "range"
                      ? dateRange.from
                        ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to?.toLocaleDateString() || "..."}`
                        : "Select dates"
                      : selectedDate
                      ? selectedDate.toLocaleDateString()
                      : "Pick a date"}
                  </button>
                  
                  {isDatePickerOpen && (
                    <div className="absolute right-0 top-full mt-2 z-10">
                      <DatePicker
                        mode={filterType}
                        selected={filterType === "range" ? dateRange : selectedDate}
                        onSelect={handleDateSelection}
                        onClose={() => setIsDatePickerOpen(false)}
                      />
                    </div>
                  )}
                </div>

                {(dateRange.from || selectedDate) && (
                  <button
                    onClick={clearDateFilters}
                    className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Active Filters */}
            {(dateRange.from || selectedDate) && (
              <div className="text-sm text-indigo-700 bg-indigo-50 p-2 rounded-md inline-flex items-center max-w-max">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                {filterType === "range"
                  ? `Showing results from ${dateRange.from?.toLocaleDateString()} to ${
                      dateRange.to?.toLocaleDateString() || "present"
                    }`
                  : `Showing results for ${selectedDate.toLocaleDateString()}`}
              </div>
            )}
          </div>

          {/* Feedback Items */}
          <div className="space-y-4">
            {paginatedFeedback.length > 0 ? (
              paginatedFeedback.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-start gap-4 p-4 sm:p-5 rounded-lg bg-white border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-indigo-100"
                >
                  <div className="w-12 h-12 flex-shrink-0 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {item.task_title.charAt(0)}
                  </div>
                  <div className="flex-grow w-full">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">
                      {item.task_title}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="space-y-2">
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-700">Course:</span>{" "}
                          {item.for_course}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-700">Instructor:</span>{" "}
                          {item.faculty}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-700">Completed:</span>{" "}
                          {new Date(item.completedAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </p>
                        <div>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium inline-block">
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
                <div className="text-gray-500 space-y-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-400">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <p className="text-lg font-medium">No feedback found</p>
                  <p className="text-sm">Try adjusting your search or date filters</p>
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {paginatedFeedback.length > 0 && totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between mt-6 gap-3">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                Previous
              </button>
              
              <div className="flex gap-1 flex-wrap justify-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-sm ${
                      currentPage === page
                        ? "bg-indigo-600 text-white"
                        : "border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
              >
                Next
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [userobj, setUserObj] = useState({});
  const router = useRouter();
  const [logoutActive, setLogoutActive] = useState(true);
  const [isMenuExpanded, setIsMenuExpanded] = useState(true); // Default to expanded
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { user, error } = await getUser();
      user ? setUserObj(user.user) : router.push("/login");
    })();
  }, []);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    setIsMobileMenuOpen(false); // Close mobile menu when tab is clicked
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Header - Visible only on mobile */}
      <div className="md:hidden bg-white w-full px-4 py-3 flex items-center justify-between shadow-md z-20 fixed top-0 left-0 right-0">
        <h2 className="text-xl font-bold text-gray-800">Student Dashboard</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-10 h-10 rounded-full hover:bg-gray-100"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Mobile Menu - Dropdown for mobile only */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 bg-white shadow-lg z-10">
          <div className="p-4">
            <div className="flex flex-col space-y-3">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={`mobile-${tab.name}`}
                    onClick={() => handleTabClick(tab.name)}
                    className={`
                      flex items-center w-full p-3 rounded-lg 
                      transition-colors duration-200
                      ${
                        activeTab === tab.name
                          ? "bg-purple-100 text-purple-700"
                          : "hover:bg-gray-100"
                      }
                    `}
                  >
                    <IconComponent className="mr-3" size={20} />
                    <span className="text-sm font-medium">{tab.name}</span>
                  </button>
                );
              })}
              
              <Separator className="my-2" />
              
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`flex items-center justify-center w-full py-3 px-4 text-white rounded-xl bg-red-600 ${
                  isLoggingOut ? "cursor-not-allowed opacity-75" : "hover:bg-red-700"
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </div>

                {isLoggingOut && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - Regular, non-transparent for tablet/desktop */}
      <motion.div
        initial={{ width: "280px" }}
        animate={{ width: isMenuExpanded ? "280px" : "80px" }}
        transition={{ type: "tween", duration: 0.3 }}
        className="hidden md:block bg-white shadow-md z-10 h-screen relative"
      >
        {/* Toggle button positioned at center of right border */}
        <div className="absolute top-1/2 -right-4 z-20">
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

        <div className="p-4">
          {isMenuExpanded ? (
            <h2 className="text-xl font-bold text-gray-800">Student Dashboard</h2>
          ) : (
            <div className="w-8 h-8"></div> /* Placeholder when collapsed */
          )}
        </div>

        <div className="flex flex-col items-center px-3 mt-4">
          {isMenuExpanded && (
            <div className="text-center">
              <h3 className="font-semibold">{userobj?.username || "Student"}</h3>
              <h3 className="font-semibold">{userobj?.email || "Student"}</h3>
              <p className="text-sm text-gray-500">Student</p>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        <nav className="space-y-2 px-3">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`
                  flex items-center w-full p-3 rounded-lg 
                  transition-colors duration-200
                  ${
                    activeTab === tab.name
                      ? "bg-purple-100 text-purple-700"
                      : "hover:bg-gray-100"
                  }
                `}
              >
                <IconComponent className={`${isMenuExpanded ? "mr-3" : ""}`} size={20} />
                {isMenuExpanded && (
                  <span className="text-sm font-medium">{tab.name}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className={`absolute bottom-0 w-full p-4 ${isMenuExpanded ? "" : "flex justify-center"}`}>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`flex items-center justify-center ${isMenuExpanded ? "w-full" : "w-12 h-12"} py-3 text-white rounded-xl bg-red-600 ${
              isLoggingOut ? "cursor-not-allowed opacity-75" : "hover:bg-red-700"
            }`}
            title={!isMenuExpanded ? "Logout" : ""}
          >
            <div className="flex items-center justify-center gap-3">
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
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 mt-14 md:mt-0">
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

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

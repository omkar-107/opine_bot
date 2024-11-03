import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Logout from "@/public/assets/Logout.svg";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import Emoji from "@/public/assets/Reaction.png";
import { Bars, FallingLines, BallTriangle } from "react-loader-spinner";

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";



import {
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
  User,
  BookOpen,X
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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

const DashboardContent = ({ userobj }) => {
  const [feedbackTasks, setFeedbackTasks] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <div className="w-full h-full flex flex-col justify-center items-center gap-2">
        <Bars
          height="80"
          width="80"
          color="#7b61ff"
          ariaLabel="bars-loading"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
        />
        <p>Hold on tight, loading your dashboard...</p>
      </div>
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
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <p>
        Welcome to your dashboard! Here, you will see an overview of your
        activities and updates.
      </p>

      <h3 className="text-xl font-semibold mt-6">Outstanding Feedbacks</h3>
      {feedbackTasks.length > 0 ? (
        <div className="mt-4 overflow-y-auto max-h-[30rem]">
          <ul className="mt-4">
            {feedbackTasks.map((task, index) => (
              <li
                key={index}
                className="mb-4 p-4 border rounded-lg shadow-lg flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={Emoji}
                    alt="Emoji"
                    width={100}
                    height={100}
                    className="mr-2"
                  />
                  <div>
                    <h4 className="font-bold text-lg">{task.title}</h4>
                    <p>Course ID: {task.course_id}</p>
                    <p>Created by: {task.created_by}</p>
                    {/* <p>Status: {task.active ? "Active" : "Inactive"}</p> */}
                    <div
                      className={`px-2 py-1 ${
                        task.active ? "bg-green-500" : "bg-red-500"
                      } text-white inline-block rounded-md mt-2`}
                    >
                      {task.active ? "Active" : "Closed"}
                    </div>
                  </div>
                </div>
                <div>
                  {task.active ? (
                    <button
                      onClick={() => {
                        handleFeedbackButton({
                          _id: task._id,
                          course_id: task.course_id,
                          created_by: task.created_by,
                        });
                      }}
                      className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                    >
                      Complete feedback now
                    </button>
                  ) : (
                    <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
                      View feedback
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No outstanding feedback tasks available.</p>
      )}
    </div>
  );
};

const ProfileContent = ({ userobj }) => {
  const [courses, setCourses] = useState([]);
  const [userDetailsObj, setUserDetailsObj] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState(userobj?.email);

  useEffect(() => {
    (async () => {
      const response = await fetch(
        "/api/student/getcourses/" + userobj.username
      );
      const courses_backend = await response.json();
      setCourses(courses_backend.student_courses);
      console.log(courses_backend.student_courses);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const response = await fetch(
        "/api/student/getdetails/" + userobj.username
      );
      const userdetails_backend = await response.json();
      setUserDetailsObj(userdetails_backend);
      console.log(userdetails_backend.user_details);
      setLoading(false);
    })();
  }, []);

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setIsEditing(false);
    const password = event.target.password.value;
    console.log("to be implemented later");
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <BallTriangle
          height={100}
          width={100}
          radius={5}
          color="#7b61ff"
          ariaLabel="ball-triangle-loading"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
        />
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          <Button
            variant="outline"
            className="border-purple-200 hover:bg-purple-50 text-purple-700"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>

        <Card className="mb-6 p-6 shadow-lg border-purple-100">
          {/* Student Header Section */}
          <div className="relative mb-8 pb-6 border-b border-purple-100">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24  rounded-xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-12 h-12 text-black" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-purple-600 font-medium bg-purple-100 px-2 py-1 rounded">
                    Student ID
                  </span>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {userobj ? userobj.username : USERNAME}
                  </h2>
                </div>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span> {userDetailsObj.branch || "Dept"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
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
            <div className="flex gap-3">
              {courses && courses.length > 0 ? (
                courses.map((course) => (
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <span className="text-sm font-semibold text-blue-700">{course}</span>
                  {/* <p className="text-xs text-blue-600 mt-1">Information Technology</p> */}
                </div>
  
                ))
              ) : (
                <div>No courses found</div>
              )}
            </div>
          </div>

          {isEditing ? (
            <form
              onSubmit={handlePasswordSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Personal Details
                </h3>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Email Address
                  </label>
                  <div className="mt-1 relative">
                    <Input
                      type="email"
                      value={userDetailsObj.email || "Email_"}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Security
                </h3>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Current Password *
                  </label>
                  <Input
                    type="password"
                    required
                    className="mt-1"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    New Password *
                  </label>
                  <Input
                    type="password"
                    required
                    className="mt-1"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Confirm Password *
                  </label>
                  <Input
                    type="password"
                    required
                    className="mt-1"
                    placeholder="Confirm new password"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-4"

                >
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                <Mail className="w-5 h-5 text-purple-600" />
                Contact Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <label className="text-sm font-medium text-gray-600">
                  Email Address
                </label>
                <p className="text-gray-800 font-medium mt-1">{email}</p>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-black-100">
            <p className="text-sm text-red-700">
              <span className="font-medium">Note:</span> Please contact your
              department admin for any queries related to your details
            </p>
          </div>
        </Card>
      </div>
    
  );
};

const FeedbackHistoryContent = (userobj) => {
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState('range');
  const [selectedDate, setSelectedDate] = useState(null);
  const itemsPerPage = 6;


  useEffect(() => {
    const fetchFeedbackHistory = async () => {
      console.log("called");
      try {
        const response = await fetch(
          `/api/student/completedfeedbacks/${userobj.username}`
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
    fetchFeedbackHistory();
  }, []);

 
  const clearDateFilters = () => {
    setDateRange({ from: null, to: null });
    setSelectedDate(null);
  };

  const filteredFeedback = feedbackHistory.filter(item => {
    const matchesSearch = item.task_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.for_course.toLowerCase().includes(searchQuery.toLowerCase());
    
    const itemDate = new Date(item.completedAt);
    
    let matchesDate = true;
    if (filterType === 'range' && (dateRange.from || dateRange.to)) {
      matchesDate = (!dateRange.from || itemDate >= dateRange.from) &&
                   (!dateRange.to || itemDate <= dateRange.to);
    } else if (filterType === 'single' && selectedDate) {
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
      <div className="w-full h-full flex flex-col justify-center items-center gap-2">
        <Bars
          height="80"
          width="80"
          color="#7b61ff"
          ariaLabel="bars-loading"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
        />
        <p>Hold on tight, loading your dashboard...</p>
      </div>
    );
  }

  return (
  //   <div>
  //     <h2 className="text-2xl font-bold mb-4">Feedback History</h2>
  //     <p>
  //       View all your past feedback and comments here. You can also track your
  //       feedback progress.
  //     </p>

  //     {feedbackHistory && feedbackHistory.length > 0 ? (
  //       <div className="mt-4 overflow-y-auto max-h-[30rem]">
  //         <ul className="mt-4">
  //           {feedbackHistory.map((task, index) => (
  //             <li
  //               key={index}
  //               className="mb-4 p-4 border rounded-lg shadow-lg flex justify-between items-center"
  //             >
  //               <div className="flex items-center gap-4">
  //                 <Image
  //                   src={Emoji}
  //                   alt="Emoji"
  //                   width={100}
  //                   height={100}
  //                   className="mr-2"
  //                 />
  //                 <div>
  //                   <h4 className="font-bold text-lg">{task.task_title}</h4>
  //                   <p>Course ID: {task.for_course}</p>
  //                   <p>Created by: {task.faculty}</p>
  //                   <p>
  //                     Completed At:{" "}
  //                     {new Date(task.completedAt).toLocaleString()}
  //                   </p>
  //                   <div
  //                     className={`px-2 py-1 ${
  //                       task.active ? "bg-green-500" : "bg-red-500"
  //                     } text-white inline-block rounded-md mt-2`}
  //                   >
  //                     {task.completed ? "Completed" : "Error"}
  //                   </div>
  //                 </div>
  //               </div>
  //             </li>
  //           ))}
  //         </ul>
  //       </div>
  //     ) : (
  //       <div className="w-full flex flex-col min-h-[500px] justify-center items-center gap-2">
  //         <Image
  //           src={FeedbackHistory}
  //           alt="Feedback History"
  //           width={200}
  //           height={200}
  //           className=""
  //         />
  //         <p>No feedback history available</p>
  //       </div>
  //     )}
  //   </div>
  // );

  <div className="w-full px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">Feedback History</h1>
      <p className="text-gray-600 mb-6">View all your past feedback and comments here. You can also track your feedback progress.</p>
      
      <Card className="w-full p-4">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search feedbacks"
                className="pl-10 pr-4 py-2 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <Select value={filterType} onValueChange={value => {
                setFilterType(value);
                clearDateFilters();
              }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select date filter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single Date</SelectItem>
                  <SelectItem value="range">Date Range</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Calendar size={20} />
                    {filterType === 'range' ? 
                      (dateRange.from ? dateRange.from.toLocaleDateString() : 'Select date range') :
                      (selectedDate ? selectedDate.toLocaleDateString() : 'Select date')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode={filterType === 'range' ? "range" : "single"}
                    selected={filterType === 'range' ? dateRange : selectedDate}
                    onSelect={filterType === 'range' ? 
                      (range) => setDateRange(range || { from: null, to: null }) :
                      (date) => setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {(dateRange.from || selectedDate) && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={clearDateFilters}
                  className="h-9 w-9"
                >
                  <X size={20} />
                </Button>
              )}
            </div>
          </div>
          {(dateRange.from || selectedDate) && (
            <div className="text-sm text-gray-500">
              {filterType === 'range' ? 
                `Showing results from ${dateRange.from?.toLocaleDateString()} to ${dateRange.to?.toLocaleDateString() || 'present'}` :
                `Showing results for ${selectedDate.toLocaleDateString()}`}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {paginatedFeedback.length > 0 ? (
            paginatedFeedback.map((item, index) => (
              <div key={index} className="flex items-start gap-4 p-6 border rounded-lg bg-white shadow-sm">
                <div className="w-12 h-12 flex-shrink-0">
                  <img src={feedbackHistory} alt="Feedback" className="w-full h-full" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold mb-1">{item.task_title}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    {/* console.log(item); */}
                    <div>
                      <p>Course ID: {item.for_course}</p>
                      <p>Created by: {item.faculty}</p>
                    </div>
                    <div>
                      <p>Completed At: {new Date(item.completedAt).toLocaleString()}</p>
                      <div className="mt-2">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {item.completed ? 'Completed' : 'Processing'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No feedback found for the selected filters
            </div>
          )}
        </div>

        {paginatedFeedback.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  onClick={() => setCurrentPage(i + 1)}
                  className="w-8 h-8 p-0"
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
};

// Array of tabs with names, components, and icon paths
const tabs = [
  {
    name: "Dashboard",
    component: <DashboardContent />,
    icon: "/assets/Dashboard.svg",
  },
  {
    name: "Profile",
    component: <ProfileContent />,
    icon: "/assets/Profile.svg",
  },
  {
    name: "Feedback History",
    component: <FeedbackHistoryContent />,
    icon: "/assets/FeedbackHistory.svg",
  },
];

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [userobj, setUserObj] = useState({});
  const router = useRouter();
  const [logoutActive, setLogoutActive] = useState(true);

  useEffect(() => {
    (async () => {
      const { user, error } = await getUser();
      user ? setUserObj(user.user) : router.push("/login");

      console.log(userobj);
    })();
  }, []);

  async function handleLogout() {
    setLogoutActive(false);
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });
    if (response.ok) {
      router.push("/");
    } else {
      console.error("Failed to logout");
    }
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-[#14171f] text-white flex flex-col justify-between items-center">
        <div className="flex flex-col justify-center gap-2">
          <h2 className="text-2xl font-bold p-4">Student Dashboard</h2>
          <div className="flex flex-col justify-center items-center mt-2 mb-8">
            <div className="h-[1px] w-[90%] bg-white mb-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <h3>{userobj ? userobj.username : USERNAME}</h3>
            <h5>Student</h5>
            <div className="h-[0.5px] w-[90%] bg-white mt-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          </div>
          <nav className="flex flex-col justify-center items-center">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center w-[80%] text-left px-2 py-2 my-2 ${
                  activeTab === tab.name
                    ? "border-2 border-[#7b61ff] rounded-2xl"
                    : ""
                }`}
              >
                <Image
                  src={tab.icon}
                  alt={`${tab.name} icon`}
                  width={20}
                  height={20}
                  className="mr-2"
                />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
        <button
          onClick={handleLogout}
          disabled={!logoutActive}
          className={`flex items-center w-[70%] justify-center rounded-md bg-[#7b61ff] text-left px-2 py-2 my-2`}
        >
          <Image
            src={Logout}
            alt={`logout icon`}
            width={20}
            height={20}
            className="mr-2"
          />
          <p className="mr-2">Logout</p>
        </button>
      </div>

      {/* Content Area */}
      {logoutActive === true ? (
        <div className="flex-1 p-8">
          {activeTab === "Profile" ? (
            <ProfileContent userobj={userobj} />
          ) : activeTab === "Feedback History" ? (
            <FeedbackHistoryContent userobj={userobj} />
          ) : (
            <DashboardContent userobj={userobj} />
          )}
        </div>
      ) : (
        <div className="w-[80%] h-full flex flex-col justify-center items-center gap-2">
          <FallingLines
            color="#7b61ff"
            width="100"
            visible={true}
            ariaLabel="logout label"
          />
          <p>Logging out ...</p>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;

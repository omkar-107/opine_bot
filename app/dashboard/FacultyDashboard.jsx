import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Bars, BallTriangle } from "react-loader-spinner";
import Emoji from "@/public/assets/Reaction.png";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  FileText,
  UserCircle2,
  LogOut,
  ChevronRight,
  Bell,
  Settings,
  ClipboardList,
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

  const openFeedbackPage = (_id) => {
    window.open("http://localhost:3000/faculty/feedbacktask/" + _id, "_blank");
  };

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

  // if (loading) {
  //   return (
  //     <div className="w-full h-full flex flex-col justify-center items-center gap-2">
  //       <Bars
  //         height="80"
  //         width="80"
  //         color="#7b61ff"
  //         ariaLabel="bars-loading"
  //         wrapperStyle={{}}
  //         wrapperClass=""
  //         visible={true}
  //       />
  //       <p>Hold on tight, loading your dashboard...</p>
  //     </div>
  //   );
  // }

  if (loading) {
    return (
      <LoadingSpinner message="Hold on tight, loading your dashboard..." />
    );
  }

  return (
    <div>
      {/* <h2 className="text-2xl font-bold mb-4">Dashboard</h2> */}
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
                  <button
                    onClick={() => {
                      openFeedbackPage(task._id);
                    }}
                    className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                  >
                    Go to Feedback Page
                  </button>
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
    <div className="w-full mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* <h2 className="text-2xl font-bold mb-6">Create New Feedback Task</h2> */}
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="title" className="block font-medium text-gray-700">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="courseId" className="block font-medium text-gray-700">
            Course *
          </label>
          <select
            id="courseId"
            value={courseId}
            onChange={(e) => {
              const selectedCourse = courses.find(
                (course) => course.id_ === e.target.value
              );
              setCourseId(selectedCourse?.id_);
            }}
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        <div className="mb-6">
          <label className="block font-medium text-gray-700">
            Faculty: <span className="font-semibold">{userobj.username}</span>
          </label>
        </div>

        <div className="mb-6 flex items-center justify-items-start">
          <label htmlFor="active" className="block font-medium text-gray-700">
            Active
          </label>
          <input
            type="checkbox"
            id="active"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="ml-2 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>

        <div className="w-full flex justify-center">
          <button
            type="submit"
            disabled={loading || !title || !courseId} // Only disable if required fields are empty
            className={`w-[50%] py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-300 ease-in-out ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Creating..." : "Create Feedback Task"}
          </button>
        </div>
      </form>
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
    <div className="w-full flex flex-col justify-center items-center gap-4">
      {/* Profile Information Section */}
      <div className="w-full mx-auto p-4 bg-white rounded-lg shadow-md">
        {/* <h2 className="text-2xl font-bold mb-4">Faculty Profile</h2> */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Username</h3>
          <p className="text-gray-700">{userDetailsObj.username}</p>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Department</h3>
          <p className="text-gray-700">{userDetailsObj.department}</p>
        </div>
      </div>

      {/* Courses Details Section */}
      <div className="w-full border-[#f7f7f7] border-2 rounded-2xl shadow-md flex flex-col justify-start gap-2 p-4 items-start">
        <h2 className="text-lg font-bold">Course Details</h2>
        {coursesDetails.length > 0 ? (
          <table className="min-w-full border-collapse block md:table">
            <thead className="block md:table-header-group">
              <tr className="border border-gray-300 md:border-none block md:table-row absolute -top-full md:top-auto -left-full md:left-auto md:relative">
                <th className="bg-[#9c89ff] text-white p-2 font-bold md:border md:border-gray-300 block md:table-cell">
                  Course Code
                </th>
                <th className="bg-[#9c89ff] text-white font-bold md:border md:border-gray-300 block md:table-cell">
                  Course Title
                </th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group overflow-y-auto max-h-96">
              {coursesDetails.map((course) => (
                <tr
                  key={course.code}
                  className="bg-gray-100 border border-gray-300 md:border-none block md:table-row"
                >
                  <td className="p-2 md:border md:border-gray-300 text-center block md:table-cell">
                    {course.id_}
                  </td>
                  <td className="p-2 md:border md:border-gray-300 text-left block md:table-cell">
                    {course.title}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>No courses found</div>
        )}
      </div>
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
          <Button
            onClick={handleLogout}
            disabled={!logoutActive}
            className="w-full"
            variant="destructive"
          >
            <LogOut className="mr-2" size={18} />
            {isMenuExpanded ? "Logout" : null}
          </Button>
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
            {activeTab}
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

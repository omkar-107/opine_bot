import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Logout from "@/public/assets/Logout.svg";
import { useRouter } from "next/navigation";
import Edit from "@/public/assets/Edit.svg";
import Student from "@/public/assets/Student.svg";
import PasswordImg from "@/public/assets/Password.svg";
import { Button } from "@/components/ui/button";
import Emoji from "@/public/assets/Reaction.png";
import { Bars, FallingLines, BallTriangle } from "react-loader-spinner";
import FeedbackHistory from "@/public/assets/FeedbackHistory.png";

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
    <div>
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>
      <div className="flex flex-col gap-4 text-[#14171f]">
        {/* Profile */}
        <div className="w-full border-[#f7f7f7] border-2 rounded-2xl shadow-md flex p-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src={Student}
              alt="Student"
              width={100}
              height={100}
              className="mx-auto"
            />
            <div>
              <h1 className="font-semibold text-xl">
                {userobj ? userobj.username : USERNAME}
              </h1>
              <h3>Student</h3>
            </div>
          </div>
          <Button
            variant="outline"
            className="text-[#14171f] flex items-center gap-2 rounded-xl"
          >
            <p>Edit</p>
            <Image
              src={Edit}
              alt="Edit"
              width={20}
              height={20}
              className="mx-auto"
            />
          </Button>
        </div>

        <div className="w-full flex items-center justify-between h-[300px]">
          {/* Personal Details */}
          <div className="w-[45%] h-full border-[#f7f7f7] border-2 rounded-2xl shadow-md flex p-4 items-center justify-between">
            <div className="flex flex-col gap-2 h-full items-center">
              <h2 className="text-lg font-bold mb-2">Personal Details</h2>
              <div className="flex w-full items-start">
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">
                      Branch
                    </h3>
                    <p className="text-md text-[#14171f]">
                      {userDetailsObj.branch || "Dept"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">
                      Email
                    </h3>
                    <p className="text-md text-[#14171f]">
                      {userDetailsObj.email || "Email_"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">
                      Year
                    </h3>
                    <p className="text-md text-[#14171f]">
                      {userDetailsObj.year || "Year"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">
                      Semester
                    </h3>
                    <p className="text-md text-[#14171f]">
                      {userDetailsObj.semester || "Sem"}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-gray-500">
                Note: Please contact your department admin for any queries
                related to your details
              </p>
            </div>
          </div>

          {/* Password Change Window */}
          <div className="w-[50%] h-full border-[#f7f7f7] border-2 rounded-2xl shadow-md flex p-4 items-center justify-between">
            <div className="flex flex-col gap-4 items-center w-full">
              <h2 className="text-lg font-bold">Password Change</h2>
              <div className="flex justify-start gap-10 items-center">
                <Image
                  src={PasswordImg}
                  alt="Password"
                  width={100}
                  height={100}
                  className=""
                />
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password *
                    </label>
                    <input
                      type="password"
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password *
                      </label>
                      <input
                        type="password"
                        className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter new password"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Confirm new password"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={true}
                    onClick={handlePasswordSubmit}
                    className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Details */}
        <div className="w-full border-[#f7f7f7] border-2 rounded-2xl shadow-md flex flex-col justify-start gap-2 p-4 items-start">
          <h2 className="text-lg font-bold">Course Details</h2>
          <div className="flex flex-wrap gap-2">
            {courses && courses.length > 0 ? (
              courses.map((course) => (
                <div className="bg-slate-200 p-2 rounded-full">{course}</div>
              ))
            ) : (
              <div>No courses found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FeedbackHistoryContent = (userobj) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Feedback History</h2>
      <p>
        View all your past feedback and comments here. You can also track your
        feedback progress.
      </p>
      <div className="w-full flex flex-col min-h-[500px] justify-center items-center gap-2">
        <Image
          src={FeedbackHistory}
          alt="Feedback History"
          width={200}
          height={200}
          className=""
        />
        <p>No feedback history available</p>
      </div>
    </div>
  );
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
    icon: "/assets/Feedback History.svg",
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
        <div className="w-full h-full flex flex-col justify-center items-center gap-2">
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

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Logout from "@/public/assets/Logout.svg";
import Image from "next/image";
import { Bars, FallingLines, BallTriangle } from "react-loader-spinner";
import Emoji from "@/public/assets/Reaction.png";

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
    window.open("https://localhost:3000/faculty/feedbacktask/" + _id, "_blank");
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
      <h2 className="text-2xl font-bold mb-6">Create New Feedback Task</h2>
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
      <h2 className="text-2xl font-bold mb-4">Feedback Analysis Dashboard</h2>
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

    // Fetch both details and courses
    fetchUserDetails();
    fetchCoursesDetails();
  }, [userobj.username]);

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
    <div className="w-full flex flex-col justify-center items-center gap-4">
      {/* Profile Information Section */}
      <div className="w-full mx-auto p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Faculty Profile</h2>
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
    component: <DashboardContent />,
    icon: "/assets/Dashboard.svg",
  },
  {
    name: "Create Feedback",
    component: <NewFeedbackContent />,
    icon: "/assets/NewFeedback.svg",
  },
  {
    name: "View Feedbacks",
    component: <FeedbackDashboardContent />,
    icon: "/assets/FeedbackDashboard.svg",
  },
  {
    name: "Profile",
    component: <ProfileContent />,
    icon: "/assets/Profile.svg",
  },
];

const FacultyDashboard = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [userobj, setUserObj] = useState({});
  const router = useRouter();
  const [logoutActive, setLogoutActive] = useState(true);

  useEffect(() => {
    (async () => {
      const { user, error } = await getUser();
      user ? setUserObj(user.user) : router.push("/login");
      console.log("userfetched", user);
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
          <h2 className="text-2xl font-bold p-4">Faculty Dashboard</h2>
          <div className="flex flex-col justify-center items-center mt-2 mb-8">
            <div className="h-[1px] w-[90%] bg-white mb-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <h3>{userobj ? userobj.username : USERNAME}</h3>
            <h5>Faculty</h5>
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
          {logoutActive === true ? (
            (() => {
              switch (activeTab) {
                case "Dashboard":
                  return (
                    <DashboardContent
                      userobj={userobj}
                      loadingParent={
                        userobj.username !== undefined ? false : true
                      }
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
            })()
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

export default FacultyDashboard;

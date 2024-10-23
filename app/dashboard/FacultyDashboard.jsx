import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Logout from "@/public/assets/Logout.svg";
import Image from "next/image";
import { Bars, FallingLines } from "react-loader-spinner";
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

const DashboardContent = ({ userobj }) => {
  const [feedbackTasks, setFeedbackTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const openFeedbackPage = (_id) => {
    window.open("https://localhost:3000/faculty/feedbacktask/" + _id, "_blank");
  };

  useEffect(() => {
    const fetchFeedbackTasks = async () => {
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
                  <div className="px-2 py-1 bg-green-400 inline-block rounded-md mt-2">
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
      ) : (
        <p>No outstanding feedback tasks available.</p>
      )}
    </div>
  );
};

const NewFeedbackContent = () => {
  return <div>NewFeedbackContent</div>;
};

const FeedbackDashboardContent = () => {
  return <div>FeedbackDashboardContent</div>;
};

const ProfileContent = () => {
  return <div>ProfileContent</div>;
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
                  return <DashboardContent userobj={userobj} />;
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

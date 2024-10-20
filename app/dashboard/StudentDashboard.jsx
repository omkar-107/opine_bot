import React, { useState, useEffect } from "react";
import Image from "next/image";
import Logout from "@/public/assets/Logout.svg";
import { useRouter } from "next/navigation";

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

const DashboardContent = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
    <p>
      Welcome to your dashboard! Here, you will see an overview of your
      activities and updates.
    </p>
  </div>
);

const ProfileContent = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Profile</h2>
    <p>
      Here you can view and update your profile details, such as name, email,
      and other personal information.
    </p>
  </div>
);

const FeedbackHistoryContent = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Feedback History</h2>
    <p>
      View all your past feedback and comments here. You can also track your
      feedback progress.
    </p>
  </div>
);

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
      <div className="flex-1 p-8">
        {tabs.find((tab) => tab.name === activeTab)?.component}
      </div>
    </div>
  );
};

export default StudentDashboard;

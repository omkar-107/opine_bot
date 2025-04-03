import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  History,
  LayoutDashboard,
  LogOut,
  Brain,
  Menu,
  UserCircle,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import DashboardContent from "@/components/student/DashboardContent";
import FeedbackHistoryContent from "@/components/student/FeedbackHistoryContent";
import ProfileContent from "@/components/student/ProfileContent";
import QuizDashboard from "@/components/student/QuizDashboard";
import Feedback from "../../components/student/QuizCodeEntry";

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

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
    {
      name: "Quiz Dashboard",
      component: <QuizDashboard userobj={userobj} />,
      icon: Brain,
      active: activeTab === "Quiz Dashboard",
    },
    {
      name : "Feedback",
      component:<Feedback userobj={userobj}/>,
      icon:Brain,
      active:activeTab === "Feedback"

    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return <DashboardContent userobj={userobj} />;
      case "Profile":
        return <ProfileContent userobj={userobj} />;
      case "Feedback History":
        return <FeedbackHistoryContent userobj={userobj} />;
      case "Quiz Dashboard":
        return <QuizDashboard userobj={userobj} />;
      case "Feedback":
        return <Feedback userobj={userobj}/>
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
                  isLoggingOut
                    ? "cursor-not-allowed opacity-75"
                    : "hover:bg-red-700"
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
            <h2 className="text-xl font-bold text-gray-800">
              Student Dashboard
            </h2>
          ) : (
            <div className="w-8 h-8"></div> /* Placeholder when collapsed */
          )}
        </div>

        <div className="flex flex-col items-center px-3 mt-4">
          {isMenuExpanded && (
            <div className="text-center">
              <h3 className="font-semibold">
                {userobj?.username || "Student"}
              </h3>
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
                <IconComponent
                  className={`${isMenuExpanded ? "mr-3" : ""}`}
                  size={20}
                />
                {isMenuExpanded && (
                  <span className="text-sm font-medium">{tab.name}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div
          className={`absolute bottom-0 w-full p-4 ${
            isMenuExpanded ? "" : "flex justify-center"
          }`}
        >
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`flex items-center justify-center ${
              isMenuExpanded ? "w-full" : "w-12 h-12"
            } py-3 text-white rounded-xl bg-red-600 ${
              isLoggingOut
                ? "cursor-not-allowed opacity-75"
                : "hover:bg-red-700"
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

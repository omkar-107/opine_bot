import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Menu,
  UserCircle2,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bars } from "react-loader-spinner";

import CreateQuizContent from "@/components/faculty/CreateQuizContent";
import DashboardContent from "@/components/faculty/DashboardContent";
import FeedbackDashboardContent from "@/components/faculty/FeedbackDashboardContent";
import NewFeedbackContent from "@/components/faculty/NewFeedbackContent";
import ProfileContent from "@/components/faculty/ProfileContent";
import ViewQuizzesContent from "@/components/faculty/ViewQuizzesContent";

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
    name: "Create Quiz",
    component: CreateQuizContent,
    icon: BookOpen,
  },
  {
    name: "View Quizzes",
    component: ViewQuizzesContent,
    icon: Lightbulb,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Track window size for responsiveness
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  // Update window dimensions on resize
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      // Auto-collapse sidebar on mobile
      if (window.innerWidth < 768) {
        setIsMenuExpanded(false);
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      handleResize(); // Initial call

      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

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

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    // Close mobile menu when a tab is selected
    if (windowSize.width < 768) {
      setIsMobileMenuOpen(false);
    }
  };

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
      case "Create Quiz":
        return <CreateQuizContent userobj={userobj} />;
      case "View Quizzes":
        return <ViewQuizzesContent userobj={userobj} />;
      case "Profile":
        return <ProfileContent userobj={userobj} />;
      default:
        return <DashboardContent userobj={userobj} />;
    }
  };

  // Determine if we're on mobile
  const isMobile = windowSize.width < 768;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Header with Hamburger */}
      {isMobile && (
        <div className="bg-white p-4 shadow-md flex items-center justify-between z-40">
          <h1 className="text-xl font-bold text-purple-700">Faculty Hub</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      )}

      {/* Mobile Menu - Slides down from top with transparency */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isMobileMenuOpen ? 1 : 0,
            height: isMobileMenuOpen ? "auto" : 0,
          }}
          transition={{ duration: 0.3 }}
          className="bg-white bg-opacity-90 backdrop-blur-sm shadow-lg z-50 overflow-hidden"
          style={{
            position: "absolute",
            top: "64px",
            left: 0,
            right: 0,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="p-4">
            <div className="flex items-center justify-center mb-4">
              <Avatar className="mr-3">
                <AvatarFallback>
                  {userobj?.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">
                  {userobj?.username || "Faculty Member"}
                </h3>
                <p className="text-sm text-gray-500">Faculty</p>
              </div>
            </div>

            <Separator className="my-4 opacity-50" />

            <nav className="space-y-2">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.name}
                  onClick={() => handleTabClick(tab.name)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    flex items-center w-full p-3 rounded-lg 
                    transition-colors duration-200
                    ${
                      activeTab === tab.name
                        ? "bg-purple-100 bg-opacity-80 text-purple-700"
                        : "hover:bg-gray-100 hover:bg-opacity-70"
                    }
                  `}
                >
                  <tab.icon className="mr-3" size={20} />
                  <div>
                    <p className="text-sm font-medium">{tab.name}</p>
                  </div>
                </motion.button>
              ))}

              <Separator className="my-4 opacity-50" />

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`flex items-center justify-center w-full py-3 text-white rounded-xl transition-all duration-300 bg-gradient-to-r from-red-600 to-red-700 shadow-lg shadow-red-200 relative overflow-hidden ${
                  isLoggingOut
                    ? "cursor-not-allowed opacity-75"
                    : "hover:shadow-xl"
                }`}
              >
                <div
                  className={`flex items-center justify-center gap-3 ${
                    isLoggingOut ? "opacity-0" : "opacity-100"
                  } transition-opacity duration-200`}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </div>

                {isLoggingOut && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </button>
            </nav>
          </div>
        </motion.div>
      )}

      {/* Backdrop overlay for mobile menu */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          style={{ top: "64px" }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar - only visible on larger screens */}
      {!isMobile && (
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
                  className="text-xl font-bold text-purple-700"
                >
                  Faculty Hub
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
            <Avatar className="mb-4">
              <AvatarFallback>
                {userobj?.username?.[0]?.toUpperCase() || "U"}
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
                onClick={() => handleTabClick(tab.name)}
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
                isLoggingOut
                  ? "cursor-not-allowed opacity-75"
                  : "hover:shadow-xl"
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
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {/* Desktop header - hidden on mobile */}
        {!isMobile && (
          <header className="flex justify-between items-center p-6">
            <motion.h1
              className="text-2xl md:text-3xl font-bold text-gray-800"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {activeTab}
            </motion.h1>
          </header>
        )}

        {/* Responsive padding adjustments */}
        <div className={`p-3 md:p-6 ${isMobile ? "pt-2" : ""}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-md p-4 md:p-6"
            >
              {isMobile && (
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  {activeTab}
                </h2>
              )}
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;

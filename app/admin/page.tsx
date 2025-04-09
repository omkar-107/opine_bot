"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CourseContent from "./course_page.jsx";
import StudentContent from "./student_page.jsx";
import FacultyContent from "./faculty_page.jsx";
import FeedBackContent from "./details/feedbacks/page.js";
import FeedBackRatings from "./feedback_page.jsx";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  LogOut,
  Book,
  UserCheck,
  FileSpreadsheet,
  PieChart,
  Bell,
  Search,
  User,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Define interfaces for the dashboard data structure
interface DashboardData {
  studentDistribution: {
    boys: number;
    girls: number;
  };
  attendance: {
    present: number[];
    absent: number[];
  };
}

interface DashboardStats {
  courseCount: number;
  studentCount: number;
  facultyCount: number;
  activeFeedbackTasks: number;
  enrollmentCount: number;
}

interface UserObject {
  username: string;
  role: string;
}

interface InfoCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradientFrom: string;
  gradientTo: string;
}

interface DashboardContentProps {
  userobj: UserObject | null;
  dashboardStats: DashboardStats;
  isLoading: boolean;
  error: string | null;
  pieData: any;
  barData: any;
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  value,
  icon,
  gradientTo,
  gradientFrom,
}) => (
  <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs sm:text-sm font-medium text-gray-500">{title}</p>
        <p className="text-xl sm:text-2xl font-bold mt-1 sm:mt-2">{value}</p>
      </div>
      <div
        className={`p-2 sm:p-3 rounded-xl bg-gradient-to-r ${gradientFrom} ${gradientTo}`}
      >
        {icon}
      </div>
    </div>
  </div>
);

const DashboardContent: React.FC<DashboardContentProps> = ({
  userobj,
  dashboardStats,
  isLoading,
  error,
  pieData,
  barData,
}) => {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white rounded-2xl p-3 md:p-4 shadow-lg gap-3 sm:gap-0">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
          <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center space-x-3 border-l pl-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <User className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium">Admin User</p>
              <p className="text-xs text-gray-500">
                {userobj ? userobj.username : "Guest"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <InfoCard
          title="Total Courses"
          value={dashboardStats.courseCount}
          icon={<BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-white" />}
          gradientFrom="from-blue-500"
          gradientTo="to-indigo-500"
        />
        <InfoCard
          title="Total Students"
          value={dashboardStats.studentCount}
          icon={<GraduationCap className="w-4 h-4 sm:w-6 sm:h-6 text-white" />}
          gradientFrom="from-pink-500"
          gradientTo="to-purple-500"
        />
        <InfoCard
          title="Total Faculty"
          value={dashboardStats.facultyCount}
          icon={<Users className="w-4 h-4 sm:w-6 sm:h-6 text-white" />}
          gradientFrom="from-orange-500"
          gradientTo="to-red-500"
        />
        <InfoCard
          title="Total Enrollments"
          value={dashboardStats.enrollmentCount}
          icon={
            <FileSpreadsheet className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          }
          gradientFrom="from-green-500"
          gradientTo="to-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center">
              <PieChart className="w-4 h-4 md:w-5 md:h-5 mr-2 text-indigo-600" />
              <h2 className="text-base md:text-lg font-semibold">
                Students Distribution
              </h2>
            </div>
            <select className="px-2 py-1 text-xs md:text-sm border rounded-lg">
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[200px] md:h-[300px] flex items-center justify-center">
            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center">
              <UserCheck className="w-4 h-4 md:w-5 md:h-5 mr-2 text-indigo-600" />
              <h2 className="text-base md:text-lg font-semibold">
                Attendance Overview
              </h2>
            </div>
            <div className="flex space-x-2">
              <button className="px-2 md:px-4 py-1 md:py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs md:text-sm font-medium hover:bg-indigo-100 transition-colors">
                Weekly
              </button>
              <button className="px-2 md:px-4 py-1 md:py-2 text-gray-500 rounded-lg text-xs md:text-sm font-medium hover:bg-gray-50 transition-colors">
                Monthly
              </button>
            </div>
          </div>
          <div className="h-[200px] md:h-[300px]">
            <Bar
              data={barData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      display: true,
                      color: "rgba(0, 0, 0, 0.05)",
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
                plugins: {
                  legend: {
                    position: "top" as const,
                    align: "end" as const,
                    labels: {
                      boxWidth: 10,
                      font: {
                        size: 10,
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Page() {
  const [userobj, setUserobj] = useState<UserObject | null>(null);
  const [activeTab, setActiveTab] = useState<String>("Dashboard");
  const [logoutActive, setLogoutActive] = useState(true);
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    studentDistribution: { boys: 0, girls: 0 },
    attendance: {
      present: [0, 0, 0, 0, 0],
      absent: [0, 0, 0, 0, 0],
    },
  });

  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    courseCount: 0,
    studentCount: 0,
    facultyCount: 0,
    activeFeedbackTasks: 0,
    enrollmentCount: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const savedTab = localStorage.getItem("activeAdminTab");
    if (savedTab) {
      if (tabs.some((tab) => tab.name === savedTab)) {
        setActiveTab(savedTab);
      }
    } else {
      setActiveTab("Dashboard");
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    // Check window size on initial load
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Set initial state based on window size
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/profile");
        const data = await response.json();
        setUserobj(data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const toggleSidebar = (): void => {
    setSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/dashboard/getdetails");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const data = await response.json();
      console.log(data);

      setDashboardStats({
        courseCount: data.courseCount,
        studentCount: data.studentCount,
        facultyCount: data.facultyCount,
        activeFeedbackTasks: data.activeFeedbackTasks,
        enrollmentCount: data.enrollmentCount || 0,
      });

      const newDashboardData: DashboardData = {
        studentDistribution: { boys: 100, girls: 40 },
        attendance: data.attendance || {
          present: [75, 80, 55, 85, 60],
          absent: [25, 20, 45, 15, 40],
        },
      };

      setDashboardData(newDashboardData);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const pieData = {
    labels: ["Boys", "Girls"],
    datasets: [
      {
        data: [
          dashboardData.studentDistribution.boys,
          dashboardData.studentDistribution.girls,
        ],
        backgroundColor: ["#818cf8", "#f472b6"],
        hoverBackgroundColor: ["#6366f1", "#ec4899"],
        borderWidth: 0,
      },
    ],
  };

  const barData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        label: "Total Present",
        data: dashboardData.attendance.present,
        backgroundColor: "#818cf8",
        borderRadius: 8,
      },
      {
        label: "Total Absent",
        data: dashboardData.attendance.absent,
        backgroundColor: "#f472b6",
        borderRadius: 8,
      },
    ],
  };

  const handleLogout = async () => {
    //clear localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("facultyActiveTab");
      localStorage.removeItem("activeAdminTab");
      localStorage.removeItem("studentActiveTab");
    }
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
    // Close mobile menu after logout button is clicked
    setIsMobileMenuOpen(false);
  };

  const handleTabChange = (tabName: String) => {
    setActiveTab(tabName);
    localStorage.setItem("activeAdminTab", tabName as string);
    // Close mobile menu after tab selection
    setIsMobileMenuOpen(false);
  };

  const tabs = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5 mr-3" />,
      component: (
        <DashboardContent
          userobj={userobj}
          dashboardStats={dashboardStats}
          isLoading={isLoading}
          error={error}
          pieData={pieData}
          barData={barData}
        />
      ),
    },
    {
      name: "Courses",
      icon: <BookOpen className="w-5 h-5 mr-3" />,
      component: <CourseContent />,
    },
    {
      name: "Faculty",
      icon: <Users className="w-5 h-5 mr-3" />,
      component: <FacultyContent />,
    },
    {
      name: "Students",
      icon: <GraduationCap className="w-5 h-5 mr-3" />,
      component: <StudentContent />,
    },
    {
      name: "Feedback",
      icon: <MessageCircle className="w-5 h-5 mr-3" />,
      component: <FeedBackContent />,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMobileMenu}
        ></div>
      )}

      {/* Sidebar - Desktop & Mobile */}
      <div
        className={`bg-white border-r border-gray-200 fixed h-full z-40 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "md:w-64" : "md:w-20"
        } ${isMobileMenuOpen ? "w-64 left-0" : "w-64 -left-64 md:left-0"}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 md:p-6 flex items-center">
            {/* Mobile Hamburger Menu Button (Now inside the sidebar header) */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden mr-3 text-indigo-600"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300">
              {!isSidebarOpen && !isMobileMenuOpen ? "AP" : "Admin Portal"}
            </h2>

            {/* Desktop Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="hidden md:block ml-auto bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isSidebarOpen ? (
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>

          <nav className="flex-1 px-2 md:px-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => handleTabChange(tab.name)}
                className={`flex items-center w-full ${
                  isSidebarOpen || isMobileMenuOpen
                    ? "justify-start px-4"
                    : "justify-center px-2"
                } py-3 rounded-xl transition-all duration-200 ${
                  activeTab === tab.name
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                title={!isSidebarOpen && !isMobileMenuOpen ? tab.name : ""}
              >
                <div className={isSidebarOpen || isMobileMenuOpen ? "" : ""}>
                  {tab.icon}
                </div>
                {(isSidebarOpen || isMobileMenuOpen) && (
                  <span className="font-medium">{tab.name}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-4">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`flex items-center ${
                isSidebarOpen || isMobileMenuOpen
                  ? "justify-start px-4"
                  : "justify-center px-2"
              } w-full py-3 text-white rounded-xl transition-all duration-300 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-200 relative overflow-hidden ${
                isLoggingOut
                  ? "cursor-not-allowed opacity-75"
                  : "hover:shadow-xl"
              }`}
              title={!isSidebarOpen && !isMobileMenuOpen ? "Logout" : ""}
            >
              <div
                className={`flex items-center ${
                  isLoggingOut ? "opacity-0" : "opacity-100"
                } transition-opacity duration-200`}
              >
                <LogOut
                  className={`w-5 h-5 ${
                    isSidebarOpen || isMobileMenuOpen ? "mr-3" : ""
                  }`}
                />
                {(isSidebarOpen || isMobileMenuOpen) && (
                  <span className="font-medium">Logout</span>
                )}
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

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "md:ml-64" : "md:ml-20"
        } ml-0 p-4 md:p-8`}
      >
        {/* Mobile Header */}
        <div className="md:hidden flex items-center mb-4 bg-white p-3 rounded-xl shadow-md">
          <button onClick={toggleMobileMenu} className="text-indigo-600 mr-3">
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Admin Portal
          </h2>
        </div>

        {/* Dashboard Content */}
        {tabs.find((tab) => tab.name === activeTab)?.component}
      </div>
    </div>
  );
}

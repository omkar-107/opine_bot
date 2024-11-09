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
} from 'lucide-react';


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
  <div className="bg-white p-6 rounded-2xl shadow-lg">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold mt-2">{value}</p>
        <div className="flex items-center mt-2"></div>
      </div>
      <div
        className={`p-3 rounded-xl bg-gradient-to-r ${gradientFrom} ${gradientTo}`}
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
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white rounded-2xl p-4 shadow-lg">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center space-x-3 border-l pl-4">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-gray-500">
                {" "}
                {userobj ? userobj.username : "Guest"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <InfoCard
          title="Total Courses"
          value={dashboardStats.courseCount}
          icon={<BookOpen className="w-6 h-6 text-white" />}
          gradientFrom="from-blue-500"
          gradientTo="to-indigo-500"
        />
        <InfoCard
          title="Total Students"
          value={dashboardStats.studentCount}
          icon={<GraduationCap className="w-6 h-6 text-white" />}
          gradientFrom="from-pink-500"
          gradientTo="to-purple-500"
        />
        <InfoCard
          title="Total Faculty"
          value={dashboardStats.facultyCount}
          icon={<Users className="w-6 h-6 text-white" />}
          gradientFrom="from-orange-500"
          gradientTo="to-red-500"
        />
        <InfoCard
          title="Total Enrollments"
          value={dashboardStats.enrollmentCount}
          icon={<FileSpreadsheet className="w-6 h-6 text-white" />}
          gradientFrom="from-green-500"
          gradientTo="to-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-indigo-600" />
              <h2 className="text-lg font-semibold">Students Distribution</h2>
            </div>
            <select className="px-3 py-1 border rounded-lg text-sm">
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[300px] flex items-center justify-center">
            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
{/* 
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-indigo-600" />
              <h2 className="text-lg font-semibold">Teacher List</h2>
            </div>
            <button className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors">
              View All
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">{error}</div>
          ) : (
            <div className="overflow-hidden rounded-xl">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          )}
        </div> */}


          {/* <div className="bg-white p-6 rounded-2xl shadow-lg">
          <FeedBackRatings avgRating={4.7} positiveCount={124} negativeCount={32} totalStudents={175}/>
          </div> */}
          
        <div className="bg-white p-6 rounded-2xl shadow-lg col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-indigo-600" />
              <h2 className="text-lg font-semibold">Attendance Overview</h2>
            </div>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors">
                Weekly
              </button>
              <button className="px-4 py-2 text-gray-500 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                Monthly
              </button>
            </div>
          </div>
          <div className="h-[300px]">
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
  const [activeTab, setActiveTab] = useState("Dashboard");
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    fetchDashboardData();
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
      component: <FeedBackContent />
    }
  ];

  return (

    <div className="flex min-h-screen bg-gray-50">
    {/* Sidebar */}
    <div 
      className={`bg-white border-r border-gray-200 fixed h-full transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:shadow-lg transition-all duration-200"
      >
        {isSidebarOpen ? (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        )}
      </button>

      <div className="flex flex-col h-full">
        <div className={`p-6 ${isSidebarOpen ? '' : 'p-4'}`}>
          <h2 className={`text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300 ${
            isSidebarOpen ? '' : 'text-center text-xl'
          }`}>
            {isSidebarOpen ? 'Admin Portal' : 'AP'}
          </h2>
        </div>

        <nav className={`flex-1 ${isSidebarOpen ? 'px-4' : 'px-2'} space-y-2`}>
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center w-full ${
                isSidebarOpen ? 'px-4' : 'px-2'
              } py-3 rounded-xl transition-all duration-200 ${
                activeTab === tab.name
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200"
                  : "text-gray-600 hover:bg-gray-50"
              } ${!isSidebarOpen ? 'justify-center' : ''}`}
              title={!isSidebarOpen ? tab.name : ''}
            >
              <div className={isSidebarOpen ? 'mr-3' : ''}>{tab.icon}</div>
              {isSidebarOpen && <span className="font-medium">{tab.name}</span>}
            </button>
          ))}
        </nav>

        <div className={`p-4 ${isSidebarOpen ? '' : 'px-2'}`}>
        <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`flex items-center ${
        isSidebarOpen ? 'justify-start px-4' : 'justify-center px-2'
      } w-full py-3 text-white rounded-xl transition-all duration-300 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-200 relative overflow-hidden ${
        isLoggingOut ? 'cursor-not-allowed opacity-75' : 'hover:shadow-xl'
      }`}
      title={!isSidebarOpen ? 'Logout' : ''}
    >
      <div className={`flex items-center ${isLoggingOut ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
        <LogOut className={`w-5 h-5 ${isSidebarOpen ? 'mr-3' : ''}`} />
        {isSidebarOpen && <span className="font-medium">Logout</span>}
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
    <div className={`flex-1 transition-all duration-300 ${
      isSidebarOpen ? 'ml-64' : 'ml-20'
    } p-8`}>
      {tabs.find((tab) => tab.name === activeTab)?.component}
    </div>
  </div>
  );
}

interface InfoCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  // trend: string;
  gradientFrom: string;
  gradientTo: string;
}

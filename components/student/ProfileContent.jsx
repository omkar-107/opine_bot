import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    AlertCircle,
    BookOpen,
    Calendar,
    GraduationCap,
    Mail,
    Shield,
    User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { BallTriangle, Bars } from "react-loader-spinner";

const LoadingSpinner = ({ type = "bars", message = "Loading..." }) => {
  return (
    <div className="h-[calc(100vh-theme(spacing.16))] flex flex-col items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        {type === "bars" ? (
          <Bars
            height="80"
            width="80"
            color="#7b61ff"
            ariaLabel="loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        ) : (
          <BallTriangle
            height={100}
            width={100}
            radius={5}
            color="#7b61ff"
            ariaLabel="loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        )}
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

const ProfileContent = ({ userobj }) => {
  const [courses, setCourses] = useState([]);
  const [userDetailsObj, setUserDetailsObj] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState(userobj?.email);
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [passwordMatch, setPasswordMatch] = useState(true);

  useEffect(() => {
    (async () => {
      const response = await fetch(
        "/api/student/getcourses/" + userobj.username
      );
      const courses_backend = await response.json();
      setCourses(courses_backend.student_courses);
    })();
  }, [userobj.username]);

  useEffect(() => {
    (async () => {
      const response = await fetch(
        "/api/student/getdetails/" + userobj.username
      );
      const userdetails_backend = await response.json();
      setUserDetailsObj(userdetails_backend);
      setLoading(false);
    })();
  }, [userobj.username]);

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    const newPassword = event.target.newPassword.value;
    const confirmPassword = event.target.confirmPassword.value;

    if (newPassword !== confirmPassword) {
      setPasswordMatch(false);
      return;
    }

    setPasswordMatch(true);
    setIsEditing(false);
    // API call would go here
  };

  if (loading) {
    return <LoadingSpinner message="Loading your profile..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            My Profile
          </h2>
          <Button
            variant="outline"
            className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-4 sm:px-6 py-1 sm:py-2 rounded-lg transition-all duration-300"
            onClick={() => setIsEditing(!isEditing)}
          >
            <span className="text-sm sm:text-base">
              {isEditing ? "Cancel" : "Edit Profile"}
            </span>
          </Button>
        </div>

        <Card className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-md sm:shadow-lg md:shadow-xl">
          <div className="p-4 sm:p-6 md:p-8">
            {/* Student Header Section */}
            <div className="mb-6 md:mb-8 pb-4 md:pb-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <div className="relative mx-auto sm:mx-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-blue-600 text-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-md">
                    <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 rounded-full inline-block mx-auto sm:mx-0">
                      Student ID
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                      {userobj?.username}
                    </h2>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-sm sm:text-base text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span>{userDetailsObj.branch || "Dept"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
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
            <div className="mb-6 md:mb-8">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-gray-800">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Current Courses
              </h3>
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start">
                {courses && courses.length > 0 ? (
                  courses.map((course, index) => (
                    <div
                      key={index}
                      className={`px-3 sm:px-4 py-2 sm:py-3 rounded-md sm:rounded-lg transition-all duration-300 cursor-pointer text-center ${
                        hoveredCourse === index
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-blue-50 text-gray-800 hover:bg-blue-100"
                      }`}
                      onMouseEnter={() => setHoveredCourse(index)}
                      onMouseLeave={() => setHoveredCourse(null)}
                    >
                      <span className="text-xs sm:text-sm font-semibold">
                        {course}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm sm:text-base w-full text-center sm:text-left">
                    No courses found
                  </div>
                )}
              </div>
            </div>

            {isEditing ? (
              <form
                onSubmit={handlePasswordSubmit}
                className="space-y-6 sm:space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      Personal Details
                    </h3>
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-gray-600">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={userDetailsObj.email || "Email_"}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border-gray-300 focus:border-blue-600 focus:ring-blue-600 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      Security
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-600">
                          Current Password
                        </label>
                        <Input
                          type="password"
                          name="currentPassword"
                          required
                          className="mt-1 border-gray-300 focus:border-blue-600 focus:ring-blue-600 text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-600">
                          New Password
                        </label>
                        <Input
                          type="password"
                          name="newPassword"
                          required
                          className="mt-1 border-gray-300 focus:border-blue-600 focus:ring-blue-600 text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-600">
                          Confirm Password
                        </label>
                        <Input
                          type="password"
                          name="confirmPassword"
                          required
                          className="mt-1 border-gray-300 focus:border-blue-600 focus:ring-blue-600 text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {!passwordMatch && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs sm:text-sm">
                      Passwords do not match. Please try again.
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300 py-2 text-sm sm:text-base"
                >
                  Save Changes
                </Button>
              </form>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 text-gray-800">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  Contact Information
                </h3>
                <div className="bg-gray-50 rounded-md sm:rounded-lg p-3 sm:p-4 border border-gray-200">
                  <label className="text-xs sm:text-sm font-medium text-gray-600">
                    Email Address
                  </label>
                  <p className="text-sm sm:text-base text-gray-800 font-medium mt-1">
                    {email}
                  </p>
                </div>
              </div>
            )}

            <Alert className="mt-4 sm:mt-6 border-l-4 border-blue-600 bg-blue-50">
              <AlertDescription className="text-xs sm:text-sm text-gray-700">
                <span className="font-medium">Note:</span> Please contact your
                department admin for any queries related to your details
              </AlertDescription>
            </Alert>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfileContent;

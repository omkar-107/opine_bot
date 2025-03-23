import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AlertCircle, BookOpen, Building2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Bars } from "react-loader-spinner";

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

const ProfileContent = ({ userobj }) => {
  const [userDetailsObj, setUserDetailsObj] = useState({});
  const [coursesDetails, setCoursesDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);

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

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 p-2 sm:p-4">
      {/* Profile Card */}
      <Card className="overflow-hidden bg-gradient-to-br from-blue-50 to-white">
        <CardHeader className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20 flex items-center justify-center">
              <User size={24} className="text-white sm:hidden" />
              <User size={32} className="text-white hidden sm:block" />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold mt-2 sm:mt-0">
                {userDetailsObj.username}
              </h2>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 sm:mt-2">
                <Building2 size={14} className="sm:size-16" />
                <span className="text-xs sm:text-sm opacity-90">
                  {userDetailsObj.department}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Courses Section */}
      <Card className="bg-white">
        <CardHeader className="flex flex-col sm:flex-row items-center sm:justify-between border-b border-blue-100 pb-3 sm:pb-4 gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="text-blue-700 size-4 sm:size-5" />
            <h2 className="text-lg sm:text-xl font-semibold text-blue-900">
              Courses
            </h2>
          </div>
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 text-xs sm:text-sm"
          >
            {coursesDetails.length} Courses
          </Badge>
        </CardHeader>
        <CardContent className="pt-3 sm:pt-4 px-2 sm:px-4">
          {coursesDetails.length > 0 ? (
            <div className="grid gap-3 sm:gap-4">
              {coursesDetails.map((course) => (
                <div
                  key={course.id_}
                  className="group p-3 sm:p-4 rounded-lg transition-all duration-200 hover:bg-blue-50 cursor-pointer border border-blue-100 hover:border-blue-300"
                  onClick={() =>
                    setSelectedCourse(
                      selectedCourse?.id_ === course.id_ ? null : course
                    )
                  }
                >
                  <div className="flex justify-between items-center">
                    <div className="space-y-1 max-w-[80%]">
                      <h3 className="font-mono text-sm sm:text-lg font-bold tracking-wider text-gray-900 truncate">
                        {course.id_}
                      </h3>
                      <p className="text-blue-700 group-hover:text-blue-800 transition-colors text-xs sm:text-base truncate">
                        {course.title}
                      </p>
                    </div>
                    <div
                      className={`transform transition-transform duration-200 flex-shrink-0 ${
                        selectedCourse?.id_ === course.id_ ? "rotate-180" : ""
                      }`}
                    >
                      <AlertCircle
                        size={16}
                        className="text-blue-400 group-hover:text-blue-600 sm:size-20"
                      />
                    </div>
                  </div>

                  {/* Expanded Course Details */}
                  {selectedCourse?.id_ === course.id_ && (
                    <div className="mt-3 sm:mt-4 p-2 sm:p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg animate-fadeIn">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                        <Badge className="bg-blue-700 text-white self-start">
                          Details
                        </Badge>
                        <div>
                          <p className="text-xs sm:text-sm text-blue-800 font-medium">
                            Course ID:{" "}
                            <span className="font-mono">{course.id_}</span>
                          </p>
                          <p className="text-xs sm:text-sm text-blue-700 mt-1">
                            Click to view more details about this course.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <BookOpen
                size={32}
                className="mx-auto mb-3 text-blue-300 sm:size-48 sm:mb-4"
              />
              <p className="text-sm sm:text-base">No courses found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileContent;

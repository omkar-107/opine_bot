import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { CheckCircle, PlusCircle, User } from "lucide-react";
import { useEffect, useState } from "react";

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-3 sm:p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <Card className="w-full max-w-2xl mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="mb-4 sm:mb-6 md:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                Create New Feedback Task
              </h2>
              <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">
                Fill in the details below to create a new feedback task
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-1 sm:space-y-2">
                <Label
                  htmlFor="title"
                  className="text-xs sm:text-sm font-medium text-gray-700"
                >
                  Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Enter feedback title"
                  className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50"
                />
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label
                  htmlFor="courseId"
                  className="text-xs sm:text-sm font-medium text-gray-700"
                >
                  Course
                </Label>
                <select
                  id="courseId"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  required
                  className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50"
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

              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg flex items-center gap-2 sm:gap-3">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Faculty</p>
                  <p className="text-sm sm:text-base font-medium text-gray-900">
                    {userobj.username}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="active"
                    checked={active}
                    onCheckedChange={(checked) => setActive(checked)}
                    className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <Label
                    htmlFor="active"
                    className="text-xs sm:text-sm font-medium text-gray-700"
                  >
                    Active Status
                  </Label>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 ml-6 sm:ml-0">
                  {active
                    ? "Task will be visible to students"
                    : "Task will be hidden from students"}
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading || !title || !courseId}
                className={`w-full py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    Create Feedback Task
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default NewFeedbackContent;

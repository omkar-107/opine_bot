import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Plus,
  X,
  Search,
  BookOpen,
  FileText,
  Hash,
  Upload,
  GraduationCap,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Course Card Component with enhanced animations and styling
const CourseCard = ({ course, onDelete }) => (
  <div className="group mb-4 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-500 p-6 transform hover:-translate-y-1 border border-gray-100">
    <div className="flex items-start gap-6">
      <div className="w-28 h-28 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center transform group-hover:rotate-3 transition-transform duration-500">
        <span className="text-3xl font-bold text-white">{course.id_}</span>
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                {course.title}
              </h3>
            </div>
            <div className="flex items-start gap-3 pr-8">
              <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors duration-300 mt-1">
                <FileText className="w-4 h-4 text-gray-600" />
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {course.syllabus}
              </p>
            </div>
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
              onClick={() => onDelete(course.id_)}
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Enhanced Add Course Form Component
const AddCourseForm = ({ onSubmit, onClose, error }) => {
  const [formData, setFormData] = useState({
    id_: "",
    title: "",
    syllabus: "",
    file: null,
  });

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const validateForm = () => {
    if (!formData.id_.trim()) {
      setFormError("Course ID is required");
      return false;
    }
    if (!formData.title.trim()) {
      setFormError("Course title is required");
      return false;
    }
    if (!formData.syllabus.trim()) {
      setFormError("Syllabus is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center backdrop-blur-sm z-50 animate-in fade-in duration-300">
      <Card className="w-2/3 max-w-2xl transform transition-all duration-500 shadow-2xl animate-in slide-in-from-bottom-4">
        <form onSubmit={handleSubmit}>
          <CardHeader className="relative border-b">
            <Button
              type="button"
              variant="ghost"
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-300"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Add New Course</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {(error || formError) && (
              <Alert
                variant="destructive"
                className="mb-6 animate-in slide-in-from-top duration-300"
              >
                <AlertDescription>{error || formError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="courseId"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Hash className="w-4 h-4 text-blue-600" />
                  Course ID
                </Label>
                <Input
                  id="courseId"
                  placeholder="e.g., CS101"
                  value={formData.id_}
                  onChange={(e) =>
                    setFormData({ ...formData, id_: e.target.value })
                  }
                  className="w-full focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="courseTitle"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Course Title
                </Label>
                <Input
                  id="courseTitle"
                  placeholder="e.g., Introduction to Computer Science"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="courseSyllabus"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <ClipboardList className="w-4 h-4 text-blue-600" />
                  Syllabus
                </Label>
                <Textarea
                  id="courseSyllabus"
                  placeholder="Enter detailed course syllabus..."
                  value={formData.syllabus}
                  onChange={(e) =>
                    setFormData({ ...formData, syllabus: e.target.value })
                  }
                  className="w-full min-h-[120px] focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="courseFile"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Upload className="w-4 h-4 text-blue-600" />
                  Course Materials (Optional)
                </Label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors duration-300">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="courseFile"
                        className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500"
                      >
                        <span>Upload a file</span>
                        <Input
                          id="courseFile"
                          type="file"
                          className="sr-only"
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              file: e.target.files[0],
                            })
                          }
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOC up to 10MB</p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 py-6 text-lg font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-3 justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    <span>Adding Course...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 justify-center">
                    <Plus className="w-5 h-5" />
                    <span>Add Course</span>
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

// Enhanced Main Course Content Component
const CourseContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/course/get");
      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      setError("Failed to load courses. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const addCourse = async (courseData) => {
    try {
      const response = await fetch("/api/admin/course/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_: courseData.id_,
          title: courseData.title,
          syllabus: courseData.syllabus,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to add course");
      }

      if (courseData.file) {
        const formData = new FormData();
        formData.append("file", courseData.file);
        formData.append("courseId", courseData.id_);

        const fileResponse = await fetch("/api/admin/course/upload-file", {
          method: "POST",
          body: formData,
        });

        if (!fileResponse.ok) {
          console.warn("File upload failed, but course was created");
        }
      }

      await fetchCourses();
    } catch (error) {
      console.error("Error adding course:", error);
      throw error;
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      const response = await fetch(`/api/admin/course/delete/${courseId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete course");
      }

      await fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      setError("Failed to delete course. Please try again later.");
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.id_.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.syllabus.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-xl bg-blue-600 text-white shadow-lg">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-4xl font-bold text-gray-800">Course Dashboard</h2>
        </div>

        {error && (
          <Alert
            variant="destructive"
            className="mb-6 animate-in slide-in-from-top duration-300"
          >
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-xl border-0 rounded-xl overflow-hidden">
          <CardHeader className="border-b bg-white">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Course Management</CardTitle>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 absolute left-3 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search courses..."
                    className="w-[300px] pl-9 pr-4 py-2 focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 gap-2"
                  onClick={() => setShowAddForm(true)}
                >
                  <Plus className="w-5 h-5" />
                  Add Course
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 gap-2"
                  onClick={() => {
                    window.open(
                      "http://localhost:3000/admin/courses/assign",
                      "_blank"
                    );
                  }}
                >
                  <Plus className="w-5 h-5" />
                  Assign Courses
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="bg-white p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id_}
                    course={course}
                    onDelete={deleteCourse}
                  />
                ))}
                {filteredCourses.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No courses found</p>
                    <p className="text-gray-400 text-sm">
                      Try adjusting your search criteria
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showAddForm && (
        <AddCourseForm
          onSubmit={addCourse}
          onClose={() => setShowAddForm(false)}
          error={error}
        />
      )}
    </div>
  );
};

export default CourseContent;

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, X, Search, BookOpen, FileText, Hash, Upload, GraduationCap, ClipboardList } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Course Card Component
const CourseCard = ({ course, onDelete }) => (
  <div className="mb-4 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-4 transform hover:-translate-y-1">
    <div className="flex items-start gap-4">
      <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
        <span className="text-2xl font-bold text-blue-600">{course.id_}</span>
      </div>
      
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-800">{course.title}</h3>
            </div>
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-gray-500 mt-1" />
              <p className="text-gray-600 text-sm">{course.syllabus}</p>
            </div>
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => onDelete(course.id_)}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Add Course Form Component
const AddCourseForm = ({ onSubmit, onClose, error }) => {
  const [formData, setFormData] = useState({
    id_: '',
    title: '',
    syllabus: '',
    file: null
  });

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const validateForm = () => {
    if (!formData.id_.trim()) {
      setFormError('Course ID is required');
      return false;
    }
    if (!formData.title.trim()) {
      setFormError('Course title is required');
      return false;
    }
    if (!formData.syllabus.trim()) {
      setFormError('Syllabus is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm z-50">
      <Card className="w-2/3 max-w-2xl transform transition-all duration-300 shadow-2xl">
        <form onSubmit={handleSubmit}>
          <CardHeader className="relative">
            <Button 
              type="button"
              variant="ghost" 
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-blue-600" />
              <CardTitle>Add New Course</CardTitle>
            </div>
          </CardHeader>

          <CardContent>
            {(error || formError) && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>
                  {error || formError}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="courseId" className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Course ID
                </Label>
                <Input
                  id="courseId"
                  placeholder="e.g., CS101"
                  value={formData.id_}
                  onChange={(e) => setFormData({ ...formData, id_: e.target.value })}
                  className="w-full"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="courseTitle" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Course Title
                </Label>
                <Input
                  id="courseTitle"
                  placeholder="e.g., Introduction to Computer Science"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="courseSyllabus" className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Syllabus
                </Label>
                <Textarea
                  id="courseSyllabus"
                  placeholder="Enter detailed course syllabus..."
                  value={formData.syllabus}
                  onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
                  className="w-full min-h-[100px]"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="courseFile" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Course Materials (Optional)
                </Label>
                <Input
                  id="courseFile"
                  type="file"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                  className="w-full cursor-pointer"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Adding Course...
                  </div>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Course
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

// Main Course Content Component
const CourseContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/course/get");
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      setError('Failed to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const addCourse = async (courseData) => {
    try {
      // First, send the course data
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
        throw new Error(errorText || 'Failed to add course');
      }

      // If there's a file, upload it separately
      if (courseData.file) {
        const formData = new FormData();
        formData.append('file', courseData.file);
        formData.append('courseId', courseData.id_);

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
        throw new Error('Failed to delete course');
      }

      await fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      setError('Failed to delete course. Please try again later.');
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.id_.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.syllabus.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
      <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          {/* <GraduationCap className="w-8 h-8 text-blue-600" /> */}
          {/* <h2 className="text-3xl font-bold text-gray-800">Course Dashboard</h2> */}
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <CardTitle className="text-2xl">Course Management</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 absolute left-3 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search courses..."
                    className="w-[300px] pl-9 pr-4 py-2"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 transition-colors"
                  onClick={() => setShowAddForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Course
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
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
                    <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
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
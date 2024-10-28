import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, X, Search, BookOpen, GraduationCap, School } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert_dialog";
import { useToast } from "@/components/ui/use-toaster";

const ENGINEERING_BRANCHES = [
  "Computer Science Engineering",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Electronics Engineering",
  "Chemical Engineering"
];

const StudentContent = () => {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [showCreateStudentDialog, setShowCreateStudentDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [newStudent, setNewStudent] = useState({
      username: "",
      password: "",
      branch: "",
      year: 1,
      student_courses: [],
    });
  
    const fetchStudents = async () => {
      try {
        const response = await fetch("/api/admin/student/getall");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch students. Please try again later.",
          variant: "destructive",
        });
        console.error("Error fetching students:", error);
      }
    };
  
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/admin/course/get");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch courses. Please try again later.",
          variant: "destructive",
        });
        console.error("Error fetching courses:", error);
      }
    };
  
    const deleteStudent = async (username) => {
      setIsLoading(true);
      console.log("Attempting to delete student with username:", username); // Log the username
      try {
          const response = await fetch(`/api/admin/student/delete/${username}`, {
              method: "DELETE",
              headers: {
                  'Content-Type': 'application/json', // Ensure content-type is set if needed
              },
          });
  
          console.log("Response status:", response.status); // Log response status
          if (!response.ok) {
              const errorData = await response.json();
              console.error("Error details:", errorData); // Log error details
              throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }
  
          // Refresh the student list after deletion
          await fetchStudents();
  
          toast({
              title: "Success",
              description: "Student deleted successfully",
          });
  
          setShowDeleteDialog(false);
          setStudentToDelete(null);
      } catch (error) {
          console.error("Error deleting student:", error); // Log the full error
          toast({
              title: "Error",
              description: error.message || "Failed to delete student. Please try again.",
              variant: "destructive",
          });
      } finally {
          setIsLoading(false);
      }
  };
  
  const addStudent = async () => {
    setIsLoading(true);
    try {

      if (!newStudent.username || !newStudent.password || !newStudent.branch || !newStudent.year) {
        throw new Error("Please fill in all required fields");
      }

      const studentData = {
        username: newStudent.username,
        password: newStudent.password,
        branch: newStudent.branch,
        year: parseInt(newStudent.year),
        student_courses: newStudent.student_courses 
      };

      console.log("Sending student data:", studentData); // Debug log

      const response = await fetch("/api/admin/student/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentData),
      });

      const responseData = await response.json();
      console.log("Server response:", responseData);

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to add student");
      }
      
      // Update the local state
      await fetchStudents(); // Refresh the student list
      
      // Reset form and close dialog
      setShowCreateStudentDialog(false);
      setNewStudent({
        username: "",
        password: "",
        branch: "",
        year: 1,
        student_courses: [],
      });
      
      toast({
        title: "Success",
        description: "Student added successfully",
      });
    } catch (error) {
      console.error("Error adding student:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
    useEffect(() => {
      fetchStudents();
      fetchCourses();
    }, []);
  
    const filteredStudents = students.filter(
      (student) =>
        student.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.branch.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
    const handleDeleteClick = (student) => {
      console.log("Selected student for deletion:", student); // Log the selected student
      setStudentToDelete(student);
      setShowDeleteDialog(true);
  };
  
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-xl">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Student Management
              </h1>
              <p className="text-gray-500">Manage and track student records</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search students..."
                className="pl-10 w-80 border-2 focus:border-blue-500 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6 py-2 transition-all duration-200 transform hover:scale-105"
              onClick={() => setShowCreateStudentDialog(true)}
              disabled={isLoading}
            >
              <span className="mr-2">+</span> Add Student
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-500">Total Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-100 p-3 rounded-xl">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-gray-500">Total Courses</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <School className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-500">Departments</p>
                <p className="text-2xl font-bold">{departments.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredStudents.length === 0 ? (
            <div className="col-span-2 text-center py-16 bg-white rounded-2xl shadow-lg">
              <div className="flex flex-col items-center gap-4">
                <User className="w-16 h-16 text-gray-300" />
                <p className="text-gray-500 text-lg">No students found</p>
              </div>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div
                key={student.username}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                          {student.username}
                        </h2>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center gap-2 text-gray-600">
                            <School className="w-4 h-4" />
                            <span>{student.branch}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <GraduationCap className="w-4 h-4" />
                            <span>Year {student.year}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteClick(student)}
                      className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                      disabled={isLoading}
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  {student.student_courses?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500 mb-2">Enrolled Courses</p>
                      <div className="flex flex-wrap gap-2">
                        {student.student_courses.map((course) => (
                          <span
                            key={course}
                            className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium"
                          >
                            {course}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Student Dialog - Enhanced */}
      <Dialog
        open={showCreateStudentDialog}
        onOpenChange={setShowCreateStudentDialog}
      >
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600">
            <DialogTitle className="text-xl font-semibold text-white">
              Add New Student
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="space-y-4">
              <Input
                required
                placeholder="Username"
                className="rounded-xl border-2 focus:border-blue-500"
                value={newStudent.username}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, username: e.target.value })
                }
              />
              <Input
                required
                type="password"
                placeholder="Password"
                className="rounded-xl border-2 focus:border-blue-500"
                value={newStudent.password}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, password: e.target.value })
                }
              />

               <Select
                value={newStudent.branch}
                onValueChange={(value) =>
                  setNewStudent({ ...newStudent, branch: value })
                }
              >
                <SelectTrigger className="w-full rounded-xl border-2 focus:border-blue-500">
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  {ENGINEERING_BRANCHES.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>


              <Select
                value={newStudent.year.toString()}
                onValueChange={(value) =>
                  setNewStudent({ ...newStudent, year: parseInt(value) })
                }
              >
                <SelectTrigger className="w-full rounded-xl border-2 focus:border-blue-500">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      Year {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                onValueChange={(value) => {
                  if (!newStudent.student_courses.includes(value)) {
                    setNewStudent({
                      ...newStudent,
                      student_courses: [...newStudent.student_courses, value],
                    });
                  }
                }}
              >
                <SelectTrigger className="w-full rounded-xl border-2 focus:border-blue-500">
                  <SelectValue placeholder="Select Courses" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id_} value={course.id_}>
                      {course.id_}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {newStudent.student_courses.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium text-gray-700">Selected Courses:</p>
                  <div className="flex flex-wrap gap-2">
                    {newStudent.student_courses.map((course) => (
                      <span
                        key={course}
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2"
                      >
                        {course}
                        <button
                          onClick={() =>
                            setNewStudent({
                              ...newStudent,
                              student_courses: newStudent.student_courses.filter(
                                (c) => c !== course
                              ),
                            })
                          }
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={addStudent}
              disabled={
                isLoading ||
                !newStudent.username ||
                !newStudent.password ||
                !newStudent.branch ||
                !newStudent.year
          
              }
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-2 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
            >
              {isLoading ? "Adding..." : "Add Student"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog - Enhanced */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-2xl p-0 overflow-hidden">
          <AlertDialogHeader className="p-6 bg-red-50">
            <AlertDialogTitle className="text-xl font-semibold text-red-600">
              Delete Student
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to delete {studentToDelete?.username}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="p-6">
            <AlertDialogCancel
              onClick={() => setShowDeleteDialog(false)}
              disabled={isLoading}
              className="rounded-xl"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 rounded-xl"
              onClick={() => {
                if (studentToDelete?.username) {
                  deleteStudent(studentToDelete.username);
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StudentContent;
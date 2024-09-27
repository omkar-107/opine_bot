"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/* -------------------- Interfaces for Schema ------------------- */
interface Student {
  id: string;
  username: string;
  password: string;
  branch: string;
  year: number;
  student_courses: string[];
}

interface Faculty {
  id: string;
  username: string;
  password: string;
  department: string;
  faculty_courses: string[];
}

interface Course {
  id: string;
  title: string;
  syllabus: string;
  faculty: string[];
  feedbacks: string[];
}

/* ------------------------ Dummy Data ------------------------ */
var courses_array: Course[] = [
  {
    id: "CS101",
    title: "Computer Science Basics",
    syllabus: "Intro to CS",
    faculty: ["dr_watson"],
    feedbacks: [],
  },
  {
    id: "EC201",
    title: "Electronics I",
    syllabus: "Basics of Electronics",
    faculty: [],
    feedbacks: [],
  },
];

var students_array: Student[] = [
  {
    id: "1",
    username: "john_doe",
    password: "pass123",
    branch: "CSE",
    year: 3,
    student_courses: ["CS101"],
  },
  {
    id: "2",
    username: "jane_smith",
    password: "pass123",
    branch: "ECE",
    year: 2,
    student_courses: [],
  },
];

var faculties_array: Faculty[] = [
  {
    id: "1",
    username: "dr_watson",
    password: "pass123",
    department: "CSE",
    faculty_courses: ["CS101"],
  },
  {
    id: "2",
    username: "dr_smith",
    password: "pass123",
    department: "ECE",
    faculty_courses: [],
  },
];

var departments_array: String[] = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Electrical",
  "Mechanical",
  "Civil",
];

/* -------------------------- Admin Component Starts from Here -------------------------*/

export default function page() {
  const [students, setStudents] = useState<Student[]>(students_array);

  const [faculties, setFaculties] = useState<Faculty[]>(faculties_array);

  const [newFaculty, setNewFaculty] = useState({
    username: "",
    password: "",
    department: "",
  });

  const [courses, setCourses] = useState<Course[]>(courses_array);

  const [newCourse, setNewCourse] = useState({
    id: "",
    title: "",
    syllabus: "",
  });
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [facultySearch, setFacultySearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [facultySuggestions, setFacultySuggestions] = useState<Faculty[]>([]);
  const [courseSuggestions, setCourseSuggestions] = useState<Course[]>([]);

  const [newStudent, setNewStudent] = useState<Student>({
    id: "",
    username: "",
    password: "",
    branch: "",
    year: 1,
    student_courses: [],
  });

  /* ------------------------- Handler Functions ------------------------- */

  //@add-new-course
  const addCourse = () => {
    setCourses([...courses, { ...newCourse, faculty: [], feedbacks: [] }]);
    setNewCourse({ id: "", title: "", syllabus: "" });
  };

  //@add-new-faculty
  const addFaculty = () => {
    const newId = (faculties.length + 1).toString();
    setFaculties([
      ...faculties,
      { ...newFaculty, id: newId, faculty_courses: [] },
    ]);
    setNewFaculty({ username: "", password: "", department: "" });
  };

  //@assign-course-to-faculty
  const assignCourseToFaculty = () => {
    if (selectedFaculty && selectedCourse) {
      const updatedFaculties = faculties.map((faculty) =>
        faculty.id === selectedFaculty.id
          ? {
              ...faculty,
              faculty_courses: [...faculty.faculty_courses, selectedCourse.id],
            }
          : faculty
      );
      setFaculties(updatedFaculties);
      setSelectedFaculty(null);
      setSelectedCourse(null);
      setFacultySearch("");
      setCourseSearch("");
    }
  };

  //@add-new-student
  const addStudent = () => {
    const newId = (students.length + 1).toString();
    setStudents([...students, { ...newStudent, id: newId }]);
    setNewStudent({
      id: "",
      username: "",
      password: "",
      branch: "",
      year: 1,
      student_courses: [],
    });
  };

  /* ------------------------- Dashboard Constants ------------------------- */

  const totalCourses = courses.length;
  const totalStudents = students.length;
  const totalFaculty = faculties.length;
  const totalEnrollments = students.reduce(
    (sum, student) => sum + student.student_courses.length,
    0
  );

  /* ------------------------- UseEffect Functions ------------------------- */

  useEffect(() => {
    const filteredFaculty = faculties
      .filter(
        (faculty) =>
          faculty.username
            .toLowerCase()
            .includes(facultySearch.toLowerCase()) ||
          faculty.department.toLowerCase().includes(facultySearch.toLowerCase())
      )
      .slice(0, 5);
    setFacultySuggestions(filteredFaculty);
  }, [facultySearch, faculties]);

  useEffect(() => {
    const filteredCourses = courses
      .filter(
        (course) =>
          course.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
          course.id.toLowerCase().includes(courseSearch.toLowerCase())
      )
      .slice(0, 5);
    setCourseSuggestions(filteredCourses);
  }, [courseSearch, courses]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="faculty">Faculty</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="dashboard">General</TabsTrigger>
        </TabsList>

        {/* ------------------------- Courses Tab ------------------------- */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Course Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-y-2 flex-col">
                  <Input
                    placeholder="Course ID"
                    value={newCourse.id}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, id: e.target.value })
                    }
                    className="mb-2 w-1/2"
                  />
                  <Input
                    placeholder="Course Title"
                    value={newCourse.title}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, title: e.target.value })
                    }
                    className="mb-2 w-1/2"
                  />
                  <Textarea
                    placeholder="Enter Syllabus Text"
                    value={newCourse.syllabus}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, syllabus: e.target.value })
                    }
                    className="mb-2 w-1/2"
                  />

                  <div className="flex items-center gap-4 w-1/2">
                    <Label htmlFor="context">Context</Label>
                    <Input id="context" type="file" />
                  </div>

                  <Button onClick={addCourse} className="w-1/4">
                    Add Course
                  </Button>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Existing Courses
                  </h3>
                  <ul className="space-y-2">
                    {courses.map((course) => (
                      <li key={course.id} className="bg-gray-100 p-2 rounded">
                        <span className="font-medium">{course.title}</span> (
                        {course.id}) - Faculty:{" "}
                        {course.faculty.join(", ") || "None"}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ------------------------- Faculty Tab ------------------------- */}
        <TabsContent value="faculty">
          <Card>
            <CardHeader>
              <CardTitle>Faculty Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Add New Faculty</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Faculty</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Input
                        placeholder="Username"
                        value={newFaculty.username}
                        onChange={(e) =>
                          setNewFaculty({
                            ...newFaculty,
                            username: e.target.value,
                          })
                        }
                      />
                      <Input
                        type="password"
                        placeholder="Password"
                        value={newFaculty.password}
                        onChange={(e) =>
                          setNewFaculty({
                            ...newFaculty,
                            password: e.target.value,
                          })
                        }
                      />

                      <Select
                        onValueChange={(value) =>
                          setNewFaculty({
                            ...newFaculty,
                            department: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments_array.map((dept, index) => (
                            <SelectItem key={index} value={dept.toString()}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        onClick={addFaculty}
                        disabled={
                          newFaculty.username === "" ||
                          newFaculty.password === "" ||
                          newFaculty.department === ""
                        }
                      >
                        Add Faculty
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="space-y-2">
                  <Input
                    placeholder="Search Faculty"
                    value={facultySearch}
                    onChange={(e) => setFacultySearch(e.target.value)}
                  />
                  {facultySuggestions.length > 0 && (
                    <ul className="bg-white border rounded-md shadow-sm">
                      {facultySuggestions.map((faculty) => (
                        <li
                          key={faculty.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setSelectedFaculty(faculty);
                            setFacultySearch(faculty.username);
                          }}
                        >
                          {faculty.username} - {faculty.department}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder="Search Course"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                  />
                  {courseSuggestions.length > 0 && (
                    <ul className="bg-white border rounded-md shadow-sm">
                      {courseSuggestions.map((course) => (
                        <li
                          key={course.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setSelectedCourse(course);
                            setCourseSearch(course.title);
                          }}
                        >
                          {course.title} ({course.id})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {selectedCourse && selectedFaculty ? (
                  <div className="flex gap-4">
                    <p>
                      <i>
                        <b>{selectedCourse.title}</b>
                      </i>{" "}
                      course is being assigned to the{" "}
                      <i>
                        <b>{selectedFaculty.username}</b>
                      </i>{" "}
                      faculty
                    </p>
                    <p
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedFaculty(null);
                        setSelectedCourse(null);
                        setFacultySearch("");
                        setCourseSearch("");
                      }}
                    >
                      <u>Click Here to Dismiss</u>
                    </p>
                  </div>
                ) : null}
                <Button
                  onClick={assignCourseToFaculty}
                  disabled={!selectedFaculty || !selectedCourse}
                >
                  Assign Course
                </Button>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Faculty List</h3>
                  <ul className="space-y-2">
                    {faculties.map((faculty) => (
                      <li key={faculty.id} className="bg-gray-100 p-2 rounded">
                        <span className="font-medium">{faculty.username}</span>{" "}
                        ({faculty.department}) - Courses:{" "}
                        {faculty.faculty_courses.join(", ") || "None"}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ------------------------- Students Tab ------------------------- */}
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Student Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Add New Student</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Student</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Input
                        required
                        placeholder="Username"
                        value={newStudent.username}
                        onChange={(e) =>
                          setNewStudent({
                            ...newStudent,
                            username: e.target.value,
                          })
                        }
                      />
                      <Input
                        required
                        type="password"
                        placeholder="Password"
                        value={newStudent.password}
                        onChange={(e) =>
                          setNewStudent({
                            ...newStudent,
                            password: e.target.value,
                          })
                        }
                      />
                      <Select
                        onValueChange={(value) =>
                          setNewStudent({
                            ...newStudent,
                            branch: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Branch" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments_array.map((dept, index) => (
                            <SelectItem key={index} value={dept.toString()}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        onValueChange={(value) =>
                          setNewStudent({
                            ...newStudent,
                            year: parseInt(value),
                          })
                        }
                      >
                        <SelectTrigger>
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

                      <Button
                        onClick={addStudent}
                        disabled={
                          !newStudent.username ||
                          !newStudent.password ||
                          !newStudent.branch ||
                          !newStudent.year
                        }
                      >
                        Add Student
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <ul className="space-y-2">
                  {students.map((student) => (
                    <li key={student.id} className="bg-gray-100 p-2 rounded">
                      <span className="font-medium">{student.username}</span> -{" "}
                      {student.branch}, Year: {student.year}, Courses:{" "}
                      {student.student_courses.join(", ") || "None"}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ------------------------- Dashboard Tab ------------------------- */}
        <TabsContent value="dashboard">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Courses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalCourses}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Students
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalStudents}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Faculty
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalFaculty}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Enrollments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalEnrollments}</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

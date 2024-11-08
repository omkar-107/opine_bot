"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import jsPDF from 'jspdf';

const ENGINEERING_BRANCHES = [
    "Computer Science",
    "Information Technology",
    "Electronics",
    "Electrical",
    "Mechanical",
    "Civil"
];

const ENGINEERING_YEARS = [1, 2, 3, 4];

const ENGINEERING_SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const StudentFilterComponent = () => {
    const [branch, setBranch] = useState('');
    const [year, setYear] = useState('');
    const [semester, setSemester] = useState('');
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleFind = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/student/getspecific', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    dept: branch,
                    year: year,
                    sem: semester
                })
            });
            const data = await response.json();
            setStudents(data.students);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await fetch("/api/admin/course/get");
            if (!response.ok) {
                throw new Error("Failed to fetch courses");
            }
            const data = await response.json();
            setCourses(data);
        } catch (error) {
            console.error("Failed to fetch courses:", error);
            setError("Failed to load courses. Please try again later.");
        }
    };

    const downloadPDF = () => {
        setIsLoading(true);
        const doc = new jsPDF();
        let yPos = 20;

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 0, 0);

        doc.text('Student List', 80, yPos); yPos += 10;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text('Department: ' + branch, 20, yPos); yPos += 10;
        doc.text('Year: ' + year, 20, yPos); yPos += 10;
        doc.text('Semester: ' + semester, 20, yPos);
        yPos += 20;
        doc.setTextColor(0, 0, 0);

        // Add table header
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');

        doc.text('Username', 10, yPos);
        doc.text('Email', 40, yPos);
        doc.text('Branch', 100, yPos);
        doc.text('Courses', 150, yPos);

        doc.setFont('helvetica', 'normal');
        yPos += 10;

        // Add table rows
        students.forEach((student) => {
            doc.text(student.username, 10, yPos);
            doc.text(student.email, 40, yPos);
            doc.text(student.branch, 100, yPos);
            doc.text(student.student_courses.length > 0 ? student.student_courses.join(', ') : '-', 150, yPos);
            yPos += 10;
        });

        doc.save('students.pdf');
        setIsLoading(false);
    }

    const handleAssignCourse = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/admin/student/assigncourse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    branch: branch,
                    year: year,
                    semester: semester,
                    course_id: selectedCourse
                })
            });
            if (response.ok) {
                // Handle successful course assignment
                alert('Course assigned successfully!');
            } else {
                // Handle error
                alert('Error assigning course. Please try again later.');
            }
        } catch (error) {
            console.error('Error assigning course:', error);
        }
        finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen p-8 relative">
            {/* Background with blur effect */}
            <div 
                className="fixed inset-0 bg-gradient-to-br from-blue-100 to-purple-100 opacity-70"
                style={{ 
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)'
                }}
            />
            
            {/* Main content */}
            <Card className="relative z-10 max-w-6xl mx-auto backdrop-blur-md bg-white/80 shadow-xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center text-gray-800">
                        Course Assignment Dashboard
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Filters Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Select value={branch} onValueChange={setBranch}>
                            <SelectTrigger className="w-full bg-white/90">
                                <SelectValue placeholder="Branch" />
                            </SelectTrigger>
                            <SelectContent>
                                {ENGINEERING_BRANCHES.map((branch) => (
                                    <SelectItem key={branch} value={branch}>
                                        {branch}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={year.toString()} onValueChange={setYear}>
                            <SelectTrigger className="w-full bg-white/90">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {ENGINEERING_YEARS.map((yearNum) => (
                                    <SelectItem key={yearNum} value={yearNum.toString()}>
                                        Year {yearNum}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={semester.toString()} onValueChange={setSemester}>
                            <SelectTrigger className="w-full bg-white/90">
                                <SelectValue placeholder="Semester" />
                            </SelectTrigger>
                            <SelectContent>
                                {ENGINEERING_SEMESTERS.map((semesterNum) => (
                                    <SelectItem key={semesterNum} value={semesterNum.toString()}>
                                        Sem {semesterNum}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4">
                        <Button 
                            onClick={handleFind} 
                            disabled={isLoading || !branch || !year || !semester}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isLoading ? 'Finding Students...' : 'Find Students'}
                        </Button>
                        <Button 
                            onClick={downloadPDF} 
                            disabled={isLoading || (students && students.length === 0)}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Download PDF
                        </Button>
                    </div>

                    {/* Course Assignment Section */}
                    {(students && students.length) > 0 && (
                        <div className="space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <Select 
                                    value={selectedCourse} 
                                    onValueChange={setSelectedCourse}
                                    className="flex-1"
                                >
                                    <SelectTrigger className="w-full bg-white/90">
                                        <SelectValue placeholder="Select a course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map((course) => (
                                            <SelectItem key={course.id_} value={course.id_}>
                                                {`${course.id_} - ${course.title}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button 
                                    onClick={handleAssignCourse} 
                                    disabled={!selectedCourse || isLoading}
                                    className="bg-purple-600 hover:bg-purple-700"
                                >
                                    Assign Course
                                </Button>
                            </div>

                            {/* Students Table */}
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <Table>
                                    <TableCaption>{`List of ${branch} students in year ${year} and sem ${semester}`}</TableCaption>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/50">
                                            <TableHead>Username</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Branch</TableHead>
                                            <TableHead>Year</TableHead>
                                            <TableHead>Semester</TableHead>
                                            <TableHead>Courses</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.map((student) => (
                                            <TableRow key={student._id} className="hover:bg-gray-50/50">
                                                <TableCell>{student.username}</TableCell>
                                                <TableCell>{student.email}</TableCell>
                                                <TableCell>{student.branch}</TableCell>
                                                <TableCell>{student.year}</TableCell>
                                                <TableCell>{student.semester}</TableCell>
                                                <TableCell>
                                                    {student.student_courses.length > 0
                                                        ? student.student_courses.join(', ')
                                                        : '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {/* No Students Message */}
                    {(!students || students.length === 0) && (
                        <p className="text-center text-gray-500 mt-4">No students found.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default StudentFilterComponent;
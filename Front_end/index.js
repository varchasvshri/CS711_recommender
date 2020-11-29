require("dotenv").config();

const fs = require("fs");

// Express
const express = require("express");
const bodyParser = require("body-parser")
const app = express();
const port = process.env.PORT || 80;

const studentData = JSON.parse(fs.readFileSync(__dirname + "/student.json"));

app.use(express.static(__dirname + '/public')); // Sets the default routing directory
app.use(bodyParser.json());
app.use(express.urlencoded({
    extended: true
}))
app.listen(port, () => console.log(`Express Server listening on http://localhost:${port}`)); // Attempts to listen on the port and tells the user.

// Requests
app.get("/GetStudentData", (req, res) => {
    let student = studentData.student;
    res.json(student)
});

app.get("/GetStudentCourseData/:id", (req, res) => {
    let student = studentData.student;
    const { id } = req.params;
    if (isNumber(id)) {
        let courses = student.Courses;
        let found = false;
        let course;
        for (let i = 0; i < courses.length; i++) {
            course = courses[i];
            if (course.ID == id) {
                found = true;
                i = courses.length;
            }
        }
        if (found) {
            res.json(course)
        } else {
            res.json({ "error": true, "message": "Course not found" })
        }
    } else {
        res.destroy();
    }
});

app.get("/GetCourseData/:id", (req, res) => {
    const { id } = req.params;
    if (isNumber(id)) {
        let courses = studentData.courses;
        let found = false;
        let course;
        for (let i = 0; i < courses.length; i++) {
            course = courses[i];
            if (course.ID == id) {
                found = true;
                i = courses.length;
            }
        }
        if (found) {
            res.json(course)
        } else {
            res.json({ "error": true, "message": "Course not found" })
        }
    } else {
        res.destroy();
    }
})

app.get("/GetCourses", (req, res) => {
    res.json(studentData.courses);
})

app.post("/AddCourseToStudent", (req, res) => {
    let courseID = req.body.optionID;
    
    if (isNumber(courseID)) {
        let courses = studentData.courses;
        let found = false;
        let course;
        for (let i = 0; i < courses.length; i++) {
            course = courses[i];
            if (course.ID == courseID) {
                found = true;
                i = courses.length;
            }
        }
        if (found) {
            let courseData = {
                "CourseID": parseInt(courseID),
                "Grade": 2,
                "Rating": 1,
                "Love": false,
                "Hate": false
            };
            studentData.student.Courses.push(courseData)
            updateStudentData();
            let temp = courseData;
            temp.Name = course.Name;
            temp.ID = course.ID;
            console.log(courseData)
            res.json(temp)
        } else {
            res.json({ "error": true, "message": "Course not found" })
        }
    } else {
        res.destroy();
    }
});

app.get("/ReactCourseData/:id/:val", (req, res) => {
    const { id, val } = req.params;
    if (isNumber(id)) {
        let courses = studentData.student.Courses;
        let found = false;
        let course;
        for (let i = 0; i < courses.length; i++) {
            course = courses[i];
            if (course.CourseID == id) {
                found = true;
                
                if (val.toLowerCase() == "love") {
                    course.Love = true;
                    course.Hate = false;
                    updateStudentData();
                    res.json({"success":true})
                } else if (val.toLowerCase() == "hate") {
                    course.Love = false;
                    course.Hate = true;
                    updateStudentData();
                    res.json({"success":true})
                } else {
                    res.json({ "error": true, "message": "Invalid value" })
                }

            }
        }
        if (!found) {
            res.json({ "error": true, "message": "Course not found" })
        }
    } else {
        res.destroy();
    }
})

app.post("/UpdateBranch", (req, res) => {
    let branchData = req.body.branchData;
    studentData.student.Branch = branchData;
    updateStudentData();
    res.json({success:true});
})

app.post("/UpdateCPI", (req, res) => {
    let CPIData = req.body.CPI;
    studentData.student.CPI = CPIData;
    updateStudentData();
    res.json({success:true});
})

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function updateStudentData() {
    fs.writeFileSync("student.json", JSON.stringify(studentData, null, 2), (err) => {
        if (err) throw err;
    });
}
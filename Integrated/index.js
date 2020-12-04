require("dotenv").config();

const fs = require("fs");
const { spawn } = require('child_process');

// Express
const express = require("express");
const bodyParser = require("body-parser")
const app = express();
const port = process.env.PORT || 80;

const studentData = {
    "Branch": "",
    "Rollno": 0,
    "CPI": "0",
    "Courses": [],
    "Dept1": "",
    "Dept3": "",
    "Dept2": ""
};
const coursesData = JSON.parse(fs.readFileSync(__dirname + "/courselist.json"));
const departmentData = JSON.parse(fs.readFileSync(__dirname + "/departmentlist.json"));
let recommendationData = JSON.parse(fs.readFileSync(__dirname + "/recommendation.json"));

app.use(express.static(__dirname + '/public')); // Sets the default routing directory
app.use(bodyParser.json());
app.use(express.urlencoded({
    extended: true
}))
app.listen(port, () => console.log(`Express Server listening on http://localhost:${port}`)); // Attempts to listen on the port and tells the user.

// Requests
app.get("/GetStudentData", (req, res) => {
    let student = studentData;
    res.json(student)
});

app.get("/GetRecommendationData", (req, res) => {
    let python = spawn('python', ['Recommend_script.py']);
    python.stdout.on('data', function (data) {
        console.log("Processing done.");
    });
    python.stderr.on('data', (data) => {
        console.log(`spawn stderr: ${data}`);
    });
    python.on('close', (code) => {
        recommendationData = JSON.parse(fs.readFileSync(__dirname + "/recommendation.json"));
        res.json(recommendationData)
    });
    python.on('error', (error) => {
        console.log(error)
    })
});

app.get("/GetStudentCourseData/:id", (req, res) => {
    const { id } = req.params;
    if (id !== "") {
        let courses = studentData.Courses;
        let found = false;
        let course;
        for (let i = 0; i < courses.length; i++) {
            course = courses[i];
            if (course.CourseID == id) {
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

app.get("/RemoveCourse/:id", (req, res) => {
    const { id } = req.params;
    if (id !== "") {
        let courses = studentData.Courses;
        let found = false;
        let course;
        let courseIndex = 0;
        for (let i = 0; i < courses.length; i++) {
            course = courses[i];
            if (course.CourseID == id) {
                found = true;
                courseIndex = i;
                i = courses.length;
            }
        }
        if (found) {
            studentData.Courses = (studentData.Courses.filter(function (value, index, arr) {
                return index != courseIndex;
            }));
            updateStudentData();
            res.json({success:true});
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
        let courses = coursesData;
        let found = false;
        let course;
        for (let i = 0; i < courses.length; i++) {
            course = courses[i];
            if (course.CourseID == id) {
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
    res.json(coursesData);
})

app.post("/AddCourseToStudent", (req, res) => {
    let courseID = req.body.optionID;

    if (courseID !== "") {
        let found = false;
        let course;
        for (let i = 0; i < coursesData.length; i++) {
            course = coursesData[i];
            if (course.CourseID == courseID) {
                found = true;
                i = coursesData.length;
            }
        }
        if (found) {
            let courseData = {
                "CourseID": courseID,
                "Love": false,
                "Hate": false
            };
            studentData.Courses.push(courseData)
            updateStudentData();
            let temp = courseData;
            temp.Name = course.Name;
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
    if (id !== "") {
        let courses = studentData.Courses;
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
                    res.json({ "success": true })
                } else if (val.toLowerCase() == "hate") {
                    course.Love = false;
                    course.Hate = true;
                    updateStudentData();
                    res.json({ "success": true })
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

app.get("/GetBranches", (req, res) => {
    res.json(departmentData);
});

app.get("/GetBranchByID/:id", (req, res) => {
    const { id } = req.params;
    if (id !== "") {
        let found = false;
        let branch;
        for (let i = 0; i < departmentData.length; i++) {
            branch = departmentData[i];
            if (branch.ID == id) {
                found = true;
                i = departmentData.length;
            }
        }
        if (found) {
            res.json(branch);
        } else {
            res.json({ "error": true, "message": "Branch not found" })
        }
    } else {
        res.json({ "error": true, "message": "Branch not found" })
    }
});

app.post("/UpdateBranch", (req, res) => {
    let branchData = req.body.branchData;
    studentData.Branch = branchData;
    updateStudentData();
    res.json({ success: true });
})

// Like a branch
app.post("/UpdateBranchLikeOne", (req, res) => {
    let branchData = req.body.branchData;
    studentData.Dept1 = branchData;
    updateStudentData();
    res.json({ success: true });
})
app.post("/UpdateBranchLikeTwo", (req, res) => {
    let branchData = req.body.branchData;
    studentData.Dept2 = branchData;
    updateStudentData();
    res.json({ success: true });
})
app.post("/UpdateBranchLikeThree", (req, res) => {
    let branchData = req.body.branchData;
    studentData.Dept3 = branchData;
    updateStudentData();
    res.json({ success: true });
})

app.post("/UpdateCPI", (req, res) => {
    let CPIData = req.body.CPI;
    studentData.CPI = CPIData;
    updateStudentData();
    res.json({ success: true });
})

app.post("/UpdateRNO", (req, res) => {
    let RNOData = req.body.RNO;
    studentData.Rollno = RNOData;
    updateStudentData();
    res.json({ success: true });
})

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function updateStudentData() {
    fs.writeFileSync("student.json", JSON.stringify(studentData, null, 2), (err) => {
        if (err) throw err;
    });
}
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
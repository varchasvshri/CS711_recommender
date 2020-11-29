let student = {};

$(document).ready(() => {
    $.ajax({
        url: "/GetStudentData",
        method: "GET",
        success: (data) => {
            student = data;
            $("#studentName").text(data.Name);
            getStudentCourse(1);
        }
    })
    initProcess();
});

function getStudentCourses() {
    for (let i = 0; i < student.Courses[i].length; i++) {
        getStudentCourse(student.Courses[i].CourseID);
    }
}

function getStudentCourse(CourseID) {
    return new Promise((resolve) => {
        $.ajax({
            url: "/GetCourseData/" + CourseID,
            method: "GET",
            success: (data) => {
                resolve(data);
            }
        })
    });
}

function initProcess() {
    if (student.Courses === undefined) {
        setTimeout(initProcess, 50)
        return;
    }
    addStudentCoursesToList();
    addCoursesToSelectCourseList();

    // Assign Form Submit Handlers
    $("#addCourseToList").click(addSelectedCourse)
}

function addStudentCoursesToList() {
    for (let i = 0; i < student.Courses.length; i++) {
        getStudentCourse(student.Courses[i].CourseID).then((courseData) => {
            addCourseToStudentCourseList(courseData.Name)
        });
    }
}

function doesStudentHaveCourseID(courseID) {
    for (let i = 0; i < student.Courses.length; i++) {
        if (student.Courses[i].CourseID == courseID) {
            return true;
        }
    }
    return false;
}

function addCourseToStudentCourseList(courseName) {

    let buttonGroup = `<div class="btn-group btn-group-toggle" data-toggle="buttons">
        <label class="btn btn-secondary">
<input type="radio" name="options" id="option2">Love
</label>
<label class="btn btn-secondary">
<input type="radio" name="options" id="option3">Hate
</label>
                        </div>`;

    let listItem = $("<li>");
    listItem.addClass("list-group-item");
    listItem.addClass("d-flex justify-content-between align-items-center");
    listItem.html(`${courseName} ${buttonGroup}`);
    $("#studentCourses").append(listItem);
}

function addCoursesToSelectCourseList() {
    $.ajax({
        url: "/GetCourses",
        method: "GET",
        success: (data) => {
            for (let i = 0; i < data.length; i++) {
                let course = data[i];
                if (!doesStudentHaveCourseID(course.ID)) {
                    addCourseToSelectCourseList(course);
                }
            }
            let select = $("#selectCourses");
            let selectOptions = $("#selectCourses option");
            if (selectOptions.length == 1) {
                select.hide();
                $("#addCourseToList").hide();
            }
        }
    })
}

function addCourseToSelectCourseList(courseData) {
    $("<option>").val(courseData.ID).text(courseData.Name).appendTo("#selectCourses");
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function addSelectedCourse() {
    let select = $("#selectCourses");
    let option = $("#selectCourses option:selected");
    if (isNumber(option.val())) {
        $.ajax({
            type: "POST",
            url: "/AddCourseToStudent",
            data: {
                optionID: option.val()
            },
            success: (data) => {
                console.log(data)
            }
        });

        addCourseToStudentCourseList(option.text());
        option.remove();
        let selectOptions = $("#selectCourses option");
        // Checks to see if options are empty
        if (selectOptions.length == 1) {
            select.hide();
            $("#addCourseToList").hide();
        }
    }
}
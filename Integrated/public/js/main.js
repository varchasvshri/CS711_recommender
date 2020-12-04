let student = {};

$(document).ready(() => {
    $.ajax({
        url: "/GetStudentData",
        method: "GET",
        success: (data) => {
            student = data;


            // My Department of Study
            let branchControl = $("#studentBranch");

            new Promise((resolve) => {
                $.ajax({
                    type:"GET",
                    url: "/GetBranches",
                    success: (data) => {
                        for(let a = 0; a < data.length; a++) {
                            let deptdata = data[a];
                            let option = $("<option>").val(deptdata.ID).text(deptdata.DeptName);
                            if(deptdata.ID == student.Branch) {
                                option.prop("selected", true);
                            }
                            option.appendTo("#studentBranch")
                        }
                        resolve();
                    }
                })
            }).then(() => branchControl.change(() => {
                $.ajax({
                    type: "POST",
                    url: "/UpdateBranch",
                    data: {
                        branchData: branchControl.val()
                    }
                });
            }));

            // Like One
            let branchControlLikeOne = $("#studentBranchLikeOne");
            new Promise((resolve) => {
                $.ajax({
                    type:"GET",
                    url: "/GetBranches",
                    success: (data) => {
                        for(let a = 0; a < data.length; a++) {
                            let deptdata = data[a];
                            let option = $("<option>").val(deptdata.ID).text(deptdata.DeptName);
                            if(deptdata.ID == student.Dept1) {
                                option.prop("selected", true);
                            }
                            option.appendTo("#studentBranchLikeOne")
                        }
                        resolve();
                    }
                })
            }).then(() => branchControlLikeOne.change(() => {
                $.ajax({
                    type: "POST",
                    url: "/UpdateBranchLikeOne",
                    data: {
                        branchData: branchControlLikeOne.val()
                    }
                });
            }));

            // Like Two
            let branchControlLikeTwo = $("#studentBranchLikeTwo");
            new Promise((resolve) => {
                $.ajax({
                    type:"GET",
                    url: "/GetBranches",
                    success: (data) => {
                        for(let a = 0; a < data.length; a++) {
                            let deptdata = data[a];
                            let option = $("<option>").val(deptdata.ID).text(deptdata.DeptName);
                            if(deptdata.ID == student.Dept2) {
                                option.prop("selected", true);
                            }
                            option.appendTo("#studentBranchLikeTwo")
                        }
                        resolve();
                    }
                })
            }).then(() => branchControlLikeTwo.change(() => {
                $.ajax({
                    type: "POST",
                    url: "/UpdateBranchLikeTwo",
                    data: {
                        branchData: branchControlLikeTwo.val()
                    }
                });
            }));

            // Like Three
            let branchControlLikeThree = $("#studentBranchLikeThree");
            new Promise((resolve) => {
                $.ajax({
                    type:"GET",
                    url: "/GetBranches",
                    success: (data) => {
                        for(let a = 0; a < data.length; a++) {
                            let deptdata = data[a];
                            let option = $("<option>").val(deptdata.ID).text(deptdata.DeptName);
                            if(deptdata.ID == student.Dept3) {
                                option.prop("selected", true);
                            }
                            option.appendTo("#studentBranchLikeThree")
                        }
                        resolve();
                    }
                })
            }).then(() => branchControlLikeThree.change(() => {
                $.ajax({
                    type: "POST",
                    url: "/UpdateBranchLikeThree",
                    data: {
                        branchData: branchControlLikeThree.val()
                    }
                });
            }));
            

            let CPIControl = $("<input/>", {
                class:"form-control",
                value:data.CPI,
                id:"studentCPIControl"
            });

            CPIControl.change(() => {
                $.ajax({
                    type: "POST",
                    url: "/UpdateCPI",
                    data: {
                        CPI: CPIControl.val()
                    }
                });
            })

            let CPI = $("<p/>").text("My CPI is ").append(CPIControl);
            $("#studentCPI").append(CPI)

            let RNOControl = $("<input/>", {
                class:"form-control",
                value:data.Rollno,
                id:"studentRNOControl"
            });

            RNOControl.change(() => {
                $.ajax({
                    type: "POST",
                    url: "/UpdateRNO",
                    data: {
                        RNO: RNOControl.val()
                    }
                });
            })

            let RNO = $("<p/>").text("My RollNumber is ").append(RNOControl);
            $("#studentRollNo").append(RNO)
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
            url: "/GetStudentCourseData/" + CourseID,
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
            addCourseToStudentCourseList(courseData)
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

function addCourseToStudentCourseList(course) {
    let courseName = course.Name;
    let courseID = course.CourseID;

    let loveInput = $("<input/>", {
        type: "radio",
        name: `options-${courseID}`,
        value: "Love",
        checked: course.Love
    });

    let loveButton = $("<label/>");
    loveButton.addClass("btn btn-secondary");
    loveButton.text("Love")
    loveButton.append(loveInput);

    if(course.Love) {
        loveButton.button('toggle');
    }

    let hateInput = $("<input/>", {
        type: "radio",
        name: `options-${courseID}`,
        value: "Hate",
        checked: course.Hate
    });

    let hateButton = $("<label/>");
    hateButton.addClass("btn btn-secondary");
    hateButton.text("Hate")
    hateButton.append(hateInput);

    if(course.Hate) {
        hateButton.button('toggle');
    }

    let deleteButton = $("<input/>", {
        type: "button",
        name: `options-${courseID}`,
        value: "Delete"
    });
    deleteButton.addClass("btn btn-danger");
    deleteButton.text("Delete")

    let buttonGroup = $("<div/>");
    buttonGroup.addClass("btn-group btn-group-toggle");
    buttonGroup.attr("id", `courseButtons-${courseID}`);
    buttonGroup.attr("data-toggle", "buttons");
    buttonGroup.append(loveButton);
    buttonGroup.append(hateButton);
    buttonGroup.append(deleteButton);

    let listItem = $("<li>");
    listItem.prop("id", `course-${courseID}`)
    listItem.addClass("list-group-item");
    listItem.addClass("d-flex justify-content-between align-items-center");
    listItem.text(`${courseID} - ${courseName}`);
    listItem.append(buttonGroup);

    $("#studentCourses").append(listItem);

    $(`#courseButtons-${courseID} [type="radio"]`).change(() => {
        let radioValue = $(`input[name='options-${courseID}']:checked`).val();
        $.ajax({
            url: `/ReactCourseData/${courseID}/${radioValue}`,
            method: "GET"
        })
    });

    $(`#courseButtons-${courseID} [type="button"]`).click(() => {
        $.ajax({
            url: `/RemoveCourse/${courseID}`,
            method: "GET",
            success: (data) => {
                if(data.success) {
                    $(`#course-${courseID}`).remove();
                }
            }
        })
    });
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
    $("<option>").val(courseData.CourseID).text(`${courseData.CourseID} - ${courseData.Name}`).appendTo("#selectCourses");
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function addSelectedCourse() {
    let select = $("#selectCourses");
    let option = $("#selectCourses option:selected");
    if (option.val() !== "") {
        $.ajax({
            type: "POST",
            url: "/AddCourseToStudent",
            data: {
                optionID: option.val()
            },
            success: (data) => {
                addCourseToStudentCourseList(data);
                option.remove();
                let selectOptions = $("#selectCourses option");
                // Checks to see if options are empty
                if (selectOptions.length == 1) {
                    select.hide();
                    $("#addCourseToList").hide();
                }
            }
        });
    }
}
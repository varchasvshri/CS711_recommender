
$(document).ready(() => {
    $.ajax({
        url: "/GetRecommendationData",
        method: "GET",
        success: (data) => {
            $("#courseLoading").hide();
            for(let i = 0; i < data.length; i++) {
                if(i >= 50) {
                    return;
                }
                let course = data[i];
                addCourseToStudentCourseList(course);
            }
        }
    });
});

function addCourseToStudentCourseList(course) {
    let courseName = course.Name;
    let courseID = course.CourseID;
    let listItem = $("<li>");
    listItem.addClass("list-group-item");
    listItem.addClass("d-flex justify-content-between align-items-center");
    listItem.text(`${courseID} - ${courseName}`);

    $("#studentCourses").append(listItem);
}

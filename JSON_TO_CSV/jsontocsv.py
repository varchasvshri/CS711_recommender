import json
import pandas as pd

with open ('flattenedGrades.json','r') as f:
    data = json.loads(f.read())

years = ["2014-15", "2015-16", "2016-17","2017-18","2018-19","2019-20"]
semester = ["1", "2", "3"]
possible_grades = {"A*":10, "A":10, "B":8, "C":6, "D":4, "E":2, "F":0, "S":4}

dict = {
    'Year':[],
    'Semester':[],
    'Course':[],
    'Total Students':[],
    'Course Name':[],
    'Average_Grade':[]
}

df = pd.DataFrame(dict)

for year in years:
    for sem in semester:
        if sem not in data[year]:
            continue

        courses = data[year][sem]
        
        for course, value in courses.items():
            
            if value["Grades"]["Total"] < 15:
                continue
            grader = value["Grades"]

            avg_grade = 0
            for g, weight in possible_grades.items():
                if g in grader:
                    avg_grade = avg_grade + weight*grader[g]

            avg_grade = avg_grade/grader["Total"]

            df.loc[len(df.index)] = [year, sem, course, grader["Total"], value["CourseName"], avg_grade]

print(df.shape)
df.to_csv('csvjson.csv') 
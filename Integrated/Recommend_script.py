import numpy as np
import pandas as pd
import json
f = open('student.json')
inp = json.load(f)

user_dept = inp['Branch']
pref1 = inp['Dept1']
pref2 = inp['Dept2']
pref3 = inp['Dept3']
user_liked = np.array([])
user_disliked = np.array([])
user_rno = int(inp['Rollno'])
for c in inp['Courses']:
    if c['Love'] == True:
        user_liked = np.append(user_liked, [c['CourseID']])
    elif c['Hate'] == True:
        user_disliked = np.append(user_disliked, [c['CourseID']])

students = pd.io.json.read_json('students.json')
y15 = pd.read_csv('y15.csv', names = ['Year', 'Sem', 'Course', 'Roll No.'])
y16 = pd.read_csv('y16.csv', names = ['Year', 'Sem', 'Course', 'Roll No.'])
y17 = pd.read_csv('y17.csv', names = ['Year', 'Sem', 'Course', 'Roll No.'])
y18 = pd.read_csv('y18.csv', names = ['Year', 'Sem', 'Course', 'Roll No.'])
y19 = pd.read_csv('y19.csv', names = ['Year', 'Sem', 'Course', 'Roll No.'])
student_courses = pd.concat([y15, y16, y17, y18, y19])

students = students[['i', 'd', 'n']]
students['i'] = pd.to_numeric(students['i'], errors = 'coerce')
students = students.loc[students['i'].isin(student_courses['Roll No.'].unique())]

course_grades = pd.read_csv('course_grades.csv')

student_courses = student_courses.apply(lambda x: x.str.strip() if x.dtype == "object" else x)
user_courses = student_courses['Course'].loc[student_courses['Roll No.'] == user_rno].unique()

students = students.loc[students['i'] != user_rno]

student_rnos = students['i'].unique()

liked_intersection = {}
disliked_intersection = {}
trimmed_rnos = np.array([])

like_int_list = {}
i = 0
for course in user_liked:
    like_int_list[course] = i
    i+=1

dislike_int_list = {}
i = 0
for course in user_disliked:
    dislike_int_list[course] = i
    i+=1

for rno1 in student_rnos:
    courses_rno1 = student_courses['Course'].loc[student_courses['Roll No.'] == rno1].to_numpy()
    liked_rno1 = np.intersect1d(courses_rno1, user_liked)
    disliked_rno1 = np.intersect1d(courses_rno1, user_disliked)
    if len(liked_rno1) == 0:
        continue
    liked_map = np.array([0]*len(user_liked))
    for c in liked_rno1:
        liked_map[like_int_list[c]] = 1
    
    liked_intersection[rno1] = liked_map
    
    disliked_map = np.array([0]*len(user_disliked))
    for c in disliked_rno1:
        disliked_map[dislike_int_list[c]] = 1
    
    disliked_intersection[rno1] = disliked_map
    trimmed_rnos = np.append(trimmed_rnos, [rno1])


def is_dominated(rno1, rno2): # check if rno1 is dominated by rno2
    liked_rno1 = liked_intersection[rno1]
    liked_rno2 = liked_intersection[rno2]
    
    disliked_rno1 = disliked_intersection[rno1]
    disliked_rno2 = disliked_intersection[rno2]

    sub = 0
    sup = 0
    strict = 0
    
    check1 = liked_rno2 >= liked_rno1
    if len(user_liked) == sum(check1):
        sub = 1
        if sum(liked_rno1) < sum(liked_rno2):
            strict = 1

    check2 = disliked_rno1 >= disliked_rno2
    if len(user_disliked) == sum(check2):
        sup = 1

    if (sub == 1) and (sup == 1) and (strict == 1):
        return 1
    return 0


def dominated(rno1):
    for x in trimmed_rnos:
        if is_dominated(rno1, x) == 1:
            return 1
    return 0

nondominated_users = trimmed_rnos[(np.array([dominated(x) for x in trimmed_rnos])) == 0]

import math

indexed_course = course_grades.set_index(['Year', 'Semester', 'Course'])

def sim_conf(rno):
    curr_courses = student_courses.loc[student_courses['Roll No.'] == rno]
    courses_rno = curr_courses['Course']
    like_int = np.intersect1d(courses_rno, user_liked)
    curr_like = curr_courses.loc[curr_courses['Course'].isin(like_int)]
    dislike_int = np.intersect1d(courses_rno, user_disliked)
    
    curr_dislike = curr_courses.loc[curr_courses['Course'].isin(dislike_int)]
    
    if len(user_liked) == 0:
        confidence = 0
    elif len(user_disliked) == 0:
        confidence = (len(like_int))/len(user_liked)
    else:
        confidence = ((len(like_int) - (len(dislike_int)/len(user_disliked)))/len(user_liked))
    
    like_grades = course_grades['Average_Grade'].loc[indexed_course.index.isin(curr_like.set_index(['Year', 'Sem', 'Course']).index)]
    dislike_grades = course_grades['Average_Grade'].loc[indexed_course.index.isin(curr_dislike.set_index(['Year', 'Sem', 'Course']).index)]
    like_grades = like_grades.to_numpy()
    dislike_grades = dislike_grades.to_numpy()
    if len(like_grades) == 0 and len(dislike_grades) == 0:
        similarity = 0
    else:
        similarity = ((sum(like_grades) - sum(dislike_grades))/10)/(math.sqrt((sum(like_grades**2)+sum(dislike_grades)**2)/100))
                                                     
    return similarity, confidence

vect = np.vectorize(sim_conf)

courses = course_grades['Course'].unique()
avg_grade = course_grades.groupby('Course', as_index = False)['Average_Grade'].mean()
avg_grade = avg_grade.set_index('Course').T.to_dict('list')
avg_grade

student_courses = student_courses.loc[student_courses['Roll No.'].isin(student_rnos)]




trust_dic={}
def trust (user,pref1,pref2,pref3):
    for i in student_rnos:
        weight = 0
        s, c = sim_conf(i)
        k= 0.2 # hyperparameter
        t=0.2
        department=students[students['i']==i]['d'].values[0]
        if(department==pref1):
            t=1
        elif(department==pref2):
            t=0.8
        elif(department==pref3):
            t=0.6
        if(s!=0 and c!=0):
            weight = (2*s*c)/(s+c)
        elif(s==0 and c!=0):
            weight=k*c
        if i in nondominated_users:
            t = t*3
        trust_dic[i]=weight*t
    return 1

trust(user_rno, pref1, pref2, pref3)

blacklist = ['CS251A', 'CS252A']

def rate_course(course):
    course_list = student_courses['Roll No.'].loc[student_courses['Course'] == course].unique()
    if course in user_courses:
        return 0
    
    if course in blacklist:
        return 0
    
    if len(course_list) == 0:
        return 0
    
    if len(course_list) > 2100:
        return 0
    
    if len(course_list) < 25:
        return 0

    
    score = 0
    x = 0
    for rno in course_list:
        score += trust_dic[rno]
        if trust_dic[rno] > 0:
            x = x+1
    if x == 0:
        x = 1
    
    
    bias = len(course_list)/400
    score = score/x
    avg = avg_grade[course][0]
    return bias + score*avg


course_ratings = np.array([rate_course(x) for x in courses])
rated = pd.DataFrame({'Rating': course_ratings}, index = courses)

rated = rated.sort_values(by = ['Rating'], ascending = False)

course_names = course_grades[['Course', 'Course Name']]
course_names = course_names.drop_duplicates(subset = 'Course', keep = 'last')
course_names = course_names.rename(columns = {'Course': 'CourseID', 'Course Name': 'Name'})
rated.reset_index(level=0, inplace=True)
rated = rated.rename(columns = {'index': 'CourseID'})
rate = rated.merge(course_names, left_on='CourseID', right_on='CourseID')
rate = rate.iloc[:50]
rate.to_json(r'./recommendation.json', orient = 'records')

print(rate)

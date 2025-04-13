-- 检查并创建数据库
CREATE DATABASE IF NOT EXISTS learning_analysis;
USE learning_analysis;

-- 如果表已存在数据，先清空表
DELETE FROM evaluations;
DELETE FROM class_students;
DELETE FROM classes;
DELETE FROM users;

-- 插入用户数据
INSERT INTO users (username, password, role, name, email, created_at, updated_at)
VALUES
('teacher1', '$2a$10$bTaQ.9JbmjFTpCt73NVQQOmXIZQHMVXO.Qpw0NgB/CDdqRPELGNxe', 'TEACHER', '李老师', 'teacher1@example.com', NOW(), NOW()),
('student1', '$2a$10$bTaQ.9JbmjFTpCt73NVQQOmXIZQHMVXO.Qpw0NgB/CDdqRPELGNxe', 'STUDENT', '张三', 'student1@example.com', NOW(), NOW()),
('student2', '$2a$10$bTaQ.9JbmjFTpCt73NVQQOmXIZQHMVXO.Qpw0NgB/CDdqRPELGNxe', 'STUDENT', '李四', 'student2@example.com', NOW(), NOW()),
('student3', '$2a$10$bTaQ.9JbmjFTpCt73NVQQOmXIZQHMVXO.Qpw0NgB/CDdqRPELGNxe', 'STUDENT', '王五', 'student3@example.com', NOW(), NOW());

-- 插入班级数据
INSERT INTO classes (name, description, teacher_id, created_at, updated_at)
VALUES
('计算机科学1班', '2023级计算机科学与技术专业1班', 1, NOW(), NOW()),
('软件工程2班', '2023级软件工程专业2班', 1, NOW(), NOW());

-- 将学生添加到班级
INSERT INTO class_students (class_id, student_id)
VALUES
(1, 2), -- 张三在计算机科学1班
(1, 3), -- 李四在计算机科学1班
(2, 4); -- 王五在软件工程2班

-- 添加评估记录
INSERT INTO evaluations (student_id, teacher_id, content, grade, created_at, updated_at)
VALUES
(2, 1, '该学生在科技创新大赛中表现优秀，展示了很强的创新能力和团队协作精神。', 'A', NOW(), NOW()),
(3, 1, '该学生积极参与课外活动，但在项目完成度方面还有待提高。', 'B', NOW(), NOW());

-- 初始化活动数据
INSERT INTO activities (title, type, description, location, start_time, end_time, status, max_participants, current_participants, organizer, creator_id, created_at, updated_at)
VALUES 
('春季运动会', 'SPORTS', '全校春季运动会，包含多种田径比赛项目。', '学校操场', '2023-05-10 08:00:00', '2023-05-12 17:00:00', 'ACTIVE', 500, 320, '体育部', 2, NOW(), NOW()),
('数学建模大赛', 'ACADEMIC', '全国大学生数学建模竞赛校内选拔赛', '理学院102教室', '2023-06-01 09:00:00', '2023-06-03 17:00:00', 'ACTIVE', 100, 78, '数学系', 2, NOW(), NOW()),
('校园歌手大赛', 'CULTURAL', '展示音乐才华的平台，欢迎所有热爱音乐的同学参与。', '大学生活动中心', '2023-06-15 18:30:00', '2023-06-15 21:30:00', 'ACTIVE', 50, 30, '校团委', 3, NOW(), NOW()),
('编程马拉松', 'ACADEMIC', '24小时不间断编程挑战，考验团队协作和技术实力。', '信息学院机房', '2023-07-01 09:00:00', '2023-07-02 09:00:00', 'UPCOMING', 60, 0, '计算机协会', 3, NOW(), NOW()),
('志愿者服务日', 'VOLUNTEER', '前往社区敬老院进行志愿服务，陪伴老人，表演节目。', '阳光敬老院', '2023-06-25 09:00:00', '2023-06-25 16:00:00', 'ACTIVE', 30, 15, '校青协', 2, NOW(), NOW());

-- 初始化活动参与表
INSERT INTO activity_participations (user_id, activity_id, status, register_time, created_at, updated_at)
VALUES 
(4, 1, 'REGISTERED', NOW(), NOW(), NOW()),
(4, 2, 'REGISTERED', NOW(), NOW(), NOW()),
(5, 1, 'REGISTERED', NOW(), NOW(), NOW()),
(5, 3, 'REGISTERED', NOW(), NOW(), NOW()),
(6, 2, 'REGISTERED', NOW(), NOW(), NOW()),
(6, 5, 'REGISTERED', NOW(), NOW(), NOW()); 
-- 如果数据库不存在，创建数据库
CREATE DATABASE IF NOT EXISTS learning_analysis;
USE learning_analysis;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    avatar_url VARCHAR(255),
    created_at DATETIME,
    updated_at DATETIME
);

-- 活动表
CREATE TABLE IF NOT EXISTS activities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL,
    max_participants INT NOT NULL,
    current_participants INT NOT NULL DEFAULT 0,
    organizer VARCHAR(255) NOT NULL,
    creator_id BIGINT,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (creator_id) REFERENCES users(id)
);

-- 活动参与记录表
CREATE TABLE IF NOT EXISTS activity_participations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    activity_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    register_time DATETIME,
    complete_time DATETIME,
    cancel_time DATETIME,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (activity_id) REFERENCES activities(id),
    UNIQUE (user_id, activity_id)
);

-- 班级表
CREATE TABLE IF NOT EXISTS classes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    teacher_id BIGINT NOT NULL,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- 班级学生关联表
CREATE TABLE IF NOT EXISTS class_students (
    class_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    PRIMARY KEY (class_id, student_id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
);

-- 班级申请表
CREATE TABLE IF NOT EXISTS class_applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    message TEXT,
    status VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL,
    handled_at DATETIME,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (class_id) REFERENCES classes(id)
);

-- 系统日志表
CREATE TABLE IF NOT EXISTS system_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    operation_type VARCHAR(50) NOT NULL,
    operation_detail TEXT,
    user_id BIGINT,
    user_role VARCHAR(20),
    ip_address VARCHAR(100),
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
); 
package com.example.learninganalysis.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.learninganalysis.model.LearningGoal;
import com.example.learninganalysis.model.User;
import java.util.List;

@Repository
public interface LearningGoalRepository extends JpaRepository<LearningGoal, Long> {
    
    // 根据教师查询学习目标
    List<LearningGoal> findByTeacherOrderByCreatedAtDesc(User teacher);
    
    // 根据学生查询学习目标
    List<LearningGoal> findByStudentOrderByCreatedAtDesc(User student);
    
    // 根据状态查询学习目标
    List<LearningGoal> findByStatusOrderByCreatedAtDesc(LearningGoal.GoalStatus status);
    
    // 根据教师和状态查询学习目标
    List<LearningGoal> findByTeacherAndStatusOrderByCreatedAtDesc(User teacher, LearningGoal.GoalStatus status);
    
    // 根据学生和状态查询学习目标
    List<LearningGoal> findByStudentAndStatusOrderByCreatedAtDesc(User student, LearningGoal.GoalStatus status);
    
    // 查询特定教师创建的学习目标总数
    long countByTeacher(User teacher);
} 
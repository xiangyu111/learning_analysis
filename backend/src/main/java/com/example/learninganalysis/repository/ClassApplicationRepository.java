package com.example.learninganalysis.repository;

import com.example.learninganalysis.model.ApplicationStatus;
import com.example.learninganalysis.model.ClassApplication;
import com.example.learninganalysis.model.ClassEntity;
import com.example.learninganalysis.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassApplicationRepository extends JpaRepository<ClassApplication, Long> {
    // 根据学生ID和班级ID查找申请
    Optional<ClassApplication> findByStudentIdAndClassEntityId(Long studentId, Long classId);
    
    // 查找学生的所有申请
    List<ClassApplication> findByStudentId(Long studentId);
    
    // 查找班级的所有申请
    List<ClassApplication> findByClassEntityId(Long classId);
    
    // 查找班级的待处理申请
    List<ClassApplication> findByClassEntityIdAndStatus(Long classId, ApplicationStatus status);
    
    // 查找特定教师创建的班级的所有申请
    List<ClassApplication> findByClassEntityTeacherId(Long teacherId);
    
    // 查询特定教师创建的班级的待处理申请
    List<ClassApplication> findByClassEntityTeacherIdAndStatus(Long teacherId, ApplicationStatus status);
    
    // 检查学生是否已经申请过某个班级
    boolean existsByStudentIdAndClassEntityId(Long studentId, Long classId);
}
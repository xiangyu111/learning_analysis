package com.example.learninganalysis.service;

import com.example.learninganalysis.model.*;
import com.example.learninganalysis.repository.ClassApplicationRepository;
import com.example.learninganalysis.repository.ClassRepository;
import com.example.learninganalysis.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ClassService {

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private ClassApplicationRepository classApplicationRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * 创建新班级
     */
    public ClassEntity createClass(ClassEntity classEntity, User teacher) {
        classEntity.setTeacher(teacher);
        return classRepository.save(classEntity);
    }

    /**
     * 获取教师创建的所有班级
     */
    public List<ClassEntity> getTeacherClasses(Long teacherId) {
        return classRepository.findByTeacherIdOrderByCreatedAtDesc(teacherId);
    }

    /**
     * 获取学生加入的所有班级
     */
    public List<ClassEntity> getStudentClasses(User student) {
        return classRepository.findByStudentsContaining(student);
    }

    /**
     * 获取学生未加入的班级列表
     */
    public List<ClassEntity> getClassesNotJoinedByStudent(Long studentId) {
        return classRepository.findClassesNotJoinedByStudent(studentId);
    }

    /**
     * 学生申请加入班级
     */
    @Transactional
    public ClassApplication applyToJoinClass(Long studentId, Long classId, String message) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("学生不存在"));
        
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("班级不存在"));
        
        // 检查学生是否已经在班级中
        if (classEntity.getStudents().contains(student)) {
            throw new RuntimeException("您已经是该班级的成员");
        }
        
        // 检查是否已经申请过
        boolean hasApplied = classApplicationRepository.existsByStudentIdAndClassEntityId(studentId, classId);
        if (hasApplied) {
            throw new RuntimeException("您已经申请过该班级，请等待审批");
        }
        
        ClassApplication application = new ClassApplication();
        application.setStudent(student);
        application.setClassEntity(classEntity);
        application.setMessage(message);
        application.setStatus(ApplicationStatus.PENDING);
        
        return classApplicationRepository.save(application);
    }

    /**
     * 教师审批班级申请
     */
    @Transactional
    public ClassApplication processApplication(Long applicationId, ApplicationStatus newStatus, String rejectReason, Long teacherId) {
        ClassApplication application = classApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("申请不存在"));
        
        // 验证是否为班级所属教师
        if (!application.getClassEntity().getTeacher().getId().equals(teacherId)) {
            throw new RuntimeException("您无权处理此申请");
        }
        
        // 如果申请已处理，不允许再次处理
        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new RuntimeException("该申请已处理");
        }
        
        application.setStatus(newStatus);
        application.setHandledAt(LocalDateTime.now());
        
        // 如果是拒绝，记录拒绝原因
        if (newStatus == ApplicationStatus.REJECTED) {
            application.setRejectReason(rejectReason);
        }
        
        // 如果是批准，将学生添加到班级
        if (newStatus == ApplicationStatus.APPROVED) {
            ClassEntity classEntity = application.getClassEntity();
            User student = application.getStudent();
            classEntity.getStudents().add(student);
            classRepository.save(classEntity);
        }
        
        return classApplicationRepository.save(application);
    }

    /**
     * 获取教师需要处理的班级申请
     */
    public List<ClassApplication> getPendingApplicationsForTeacher(Long teacherId) {
        return classApplicationRepository.findByClassEntityTeacherIdAndStatus(teacherId, ApplicationStatus.PENDING);
    }

    /**
     * 获取学生的申请历史
     */
    public List<ClassApplication> getStudentApplications(Long studentId) {
        return classApplicationRepository.findByStudentId(studentId);
    }

    /**
     * 取消班级申请
     */
    @Transactional
    public void cancelApplication(Long applicationId, Long studentId) {
        ClassApplication application = classApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("申请不存在"));
        
        // 验证是否为申请人本人
        if (!application.getStudent().getId().equals(studentId)) {
            throw new RuntimeException("您无权取消此申请");
        }
        
        // 只有待处理的申请可以取消
        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new RuntimeException("申请已处理，无法取消");
        }
        
        classApplicationRepository.delete(application);
    }

    /**
     * 获取班级详情
     */
    public ClassEntity getClassById(Long classId) {
        return classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("班级不存在"));
    }

    /**
     * 更新班级信息
     */
    @Transactional
    public ClassEntity updateClass(Long classId, ClassEntity updatedClass, Long teacherId) {
        ClassEntity existingClass = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("班级不存在"));
        
        // 验证是否为班级所属教师
        if (!existingClass.getTeacher().getId().equals(teacherId)) {
            throw new RuntimeException("您无权修改此班级");
        }
        
        existingClass.setName(updatedClass.getName());
        existingClass.setDescription(updatedClass.getDescription());
        
        return classRepository.save(existingClass);
    }

    /**
     * 移除班级学生
     */
    @Transactional
    public void removeStudentFromClass(Long classId, Long studentId, Long teacherId) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("班级不存在"));
        
        // 验证是否为班级所属教师
        if (!classEntity.getTeacher().getId().equals(teacherId)) {
            throw new RuntimeException("您无权操作此班级");
        }
        
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("学生不存在"));
        
        if (!classEntity.getStudents().contains(student)) {
            throw new RuntimeException("该学生不在班级中");
        }
        
        classEntity.getStudents().remove(student);
        classRepository.save(classEntity);
    }
}
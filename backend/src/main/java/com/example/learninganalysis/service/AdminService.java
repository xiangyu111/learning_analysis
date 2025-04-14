package com.example.learninganalysis.service;

import com.example.learninganalysis.model.ClassEntity;
import com.example.learninganalysis.model.OperationType;
import com.example.learninganalysis.model.User;
import com.example.learninganalysis.model.UserRole;
import com.example.learninganalysis.repository.ClassRepository;
import com.example.learninganalysis.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class AdminService {
    private static final Logger logger = Logger.getLogger(AdminService.class.getName());

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private LogService logService;

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * 创建班级
     */
    @Transactional
    public ClassEntity createClass(ClassEntity classEntity, Long teacherId, String ipAddress, User adminUser) {
        // 检查教师是否存在
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("教师不存在"));

        // 验证用户角色是否为教师
        if (teacher.getRole() != UserRole.TEACHER) {
            throw new RuntimeException("只有教师可以被分配为班级教师");
        }

        // 设置班级教师
        classEntity.setTeacher(teacher);

        // 保存班级
        ClassEntity savedClass = classRepository.save(classEntity);

        // 记录操作日志
        String logDetail = "管理员创建了班级: " + classEntity.getName() + ", 班级ID: " + savedClass.getId() 
                + ", 分配教师: " + teacher.getUsername();
        logService.createLog(OperationType.CLASS_CREATE, logDetail, adminUser, ipAddress);

        return savedClass;
    }

    /**
     * 获取所有班级列表（包含教师信息）
     */
    public List<Map<String, Object>> getAllClasses() {
        List<ClassEntity> classes = classRepository.findAll();
        
        return classes.stream().map(cls -> {
            Map<String, Object> classMap = new HashMap<>();
            classMap.put("id", cls.getId());
            classMap.put("name", cls.getName());
            classMap.put("description", cls.getDescription());
            classMap.put("studentCount", cls.getStudents().size());
            classMap.put("createdAt", cls.getCreatedAt().format(formatter));
            
            // 教师信息
            Map<String, Object> teacherInfo = new HashMap<>();
            teacherInfo.put("id", cls.getTeacher().getId());
            teacherInfo.put("name", cls.getTeacher().getName());
            teacherInfo.put("username", cls.getTeacher().getUsername());
            teacherInfo.put("avatarUrl", cls.getTeacher().getAvatarUrl());
            
            classMap.put("teacher", teacherInfo);
            
            return classMap;
        }).collect(Collectors.toList());
    }

    /**
     * 获取班级详情（包含学生列表）
     */
    public Map<String, Object> getClassDetail(Long classId) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("班级不存在"));
        
        Map<String, Object> classDetail = new HashMap<>();
        classDetail.put("id", classEntity.getId());
        classDetail.put("name", classEntity.getName());
        classDetail.put("description", classEntity.getDescription());
        classDetail.put("createdAt", classEntity.getCreatedAt().format(formatter));
        
        // 教师信息
        Map<String, Object> teacherInfo = new HashMap<>();
        teacherInfo.put("id", classEntity.getTeacher().getId());
        teacherInfo.put("name", classEntity.getTeacher().getName());
        teacherInfo.put("username", classEntity.getTeacher().getUsername());
        teacherInfo.put("avatarUrl", classEntity.getTeacher().getAvatarUrl());
        
        classDetail.put("teacher", teacherInfo);
        
        // 学生列表
        List<Map<String, Object>> studentList = classEntity.getStudents().stream().map(student -> {
            Map<String, Object> studentMap = new HashMap<>();
            studentMap.put("id", student.getId());
            studentMap.put("name", student.getName());
            studentMap.put("username", student.getUsername());
            studentMap.put("email", student.getEmail());
            studentMap.put("avatarUrl", student.getAvatarUrl());
            return studentMap;
        }).collect(Collectors.toList());
        
        classDetail.put("students", studentList);
        classDetail.put("studentCount", studentList.size());
        
        return classDetail;
    }

    /**
     * 更新班级信息（包括分配教师）
     */
    @Transactional
    public ClassEntity updateClass(Long classId, ClassEntity updatedClass, Long teacherId, String ipAddress, User adminUser) {
        ClassEntity existingClass = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("班级不存在"));
        
        // 更新基本信息
        existingClass.setName(updatedClass.getName());
        existingClass.setDescription(updatedClass.getDescription());
        
        // 如果指定了新教师，则更新教师
        if (teacherId != null) {
            User teacher = userRepository.findById(teacherId)
                    .orElseThrow(() -> new RuntimeException("教师不存在"));
            
            // 验证用户角色是否为教师
            if (teacher.getRole() != UserRole.TEACHER) {
                throw new RuntimeException("只有教师可以被分配为班级教师");
            }
            
            existingClass.setTeacher(teacher);
        }
        
        // 保存更新后的班级
        ClassEntity savedClass = classRepository.save(existingClass);
        
        // 记录操作日志
        String logDetail = "管理员更新了班级: " + existingClass.getName() + ", 班级ID: " + savedClass.getId();
        if (teacherId != null) {
            logDetail += ", 重新分配教师ID: " + teacherId;
        }
        logService.createLog(OperationType.CLASS_UPDATE, logDetail, adminUser, ipAddress);
        
        return savedClass;
    }

    /**
     * 获取所有教师列表
     */
    public List<Map<String, Object>> getAllTeachers() {
        List<User> teachers = userRepository.findByRole(UserRole.TEACHER);
        
        return teachers.stream().map(teacher -> {
            Map<String, Object> teacherMap = new HashMap<>();
            teacherMap.put("id", teacher.getId());
            teacherMap.put("name", teacher.getName());
            teacherMap.put("username", teacher.getUsername());
            teacherMap.put("email", teacher.getEmail());
            teacherMap.put("avatarUrl", teacher.getAvatarUrl());
            teacherMap.put("createdAt", teacher.getCreatedAt().format(formatter));
            
            // 获取教师管理的班级数量
            List<ClassEntity> managedClasses = classRepository.findByTeacherId(teacher.getId());
            teacherMap.put("managedClassCount", managedClasses.size());
            
            return teacherMap;
        }).collect(Collectors.toList());
    }

    /**
     * 获取未分配班级的教师列表
     */
    public List<Map<String, Object>> getUnassignedTeachers() {
        List<User> allTeachers = userRepository.findByRole(UserRole.TEACHER);
        List<User> assignedTeachers = classRepository.findDistinctTeachers();
        
        List<User> unassignedTeachers = new ArrayList<>(allTeachers);
        unassignedTeachers.removeAll(assignedTeachers);
        
        return unassignedTeachers.stream().map(teacher -> {
            Map<String, Object> teacherMap = new HashMap<>();
            teacherMap.put("id", teacher.getId());
            teacherMap.put("name", teacher.getName());
            teacherMap.put("username", teacher.getUsername());
            teacherMap.put("email", teacher.getEmail());
            teacherMap.put("avatarUrl", teacher.getAvatarUrl());
            return teacherMap;
        }).collect(Collectors.toList());
    }
    
    /**
     * 获取所有学生列表
     */
    public List<Map<String, Object>> getAllStudents() {
        List<User> students = userRepository.findByRole(UserRole.STUDENT);
        
        return students.stream().map(student -> {
            Map<String, Object> studentMap = new HashMap<>();
            studentMap.put("id", student.getId());
            studentMap.put("name", student.getName());
            studentMap.put("username", student.getUsername());
            studentMap.put("email", student.getEmail());
            studentMap.put("avatarUrl", student.getAvatarUrl());
            studentMap.put("createdAt", student.getCreatedAt().format(formatter));
            
            // 获取学生加入的班级数量
            long classCount = classRepository.countClassesJoinedByStudent(student.getId());
            studentMap.put("classCount", classCount);
            
            return studentMap;
        }).collect(Collectors.toList());
    }
    
    /**
     * 获取简化的班级列表（用于下拉选择）
     */
    public List<Map<String, Object>> getSimpleClasses() {
        List<ClassEntity> classes = classRepository.findAll();
        
        return classes.stream().map(cls -> {
            Map<String, Object> classMap = new HashMap<>();
            classMap.put("id", cls.getId());
            classMap.put("name", cls.getName());
            classMap.put("teacherName", cls.getTeacher().getName());
            
            return classMap;
        }).collect(Collectors.toList());
    }
} 
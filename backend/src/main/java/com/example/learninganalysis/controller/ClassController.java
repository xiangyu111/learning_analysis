package com.example.learninganalysis.controller;

import com.example.learninganalysis.model.*;
import com.example.learninganalysis.service.ClassService;
import com.example.learninganalysis.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/classes")
public class ClassController {
    private static final Logger logger = Logger.getLogger(ClassController.class.getName());
    
    @Autowired
    private ClassService classService;
    
    @Autowired
    private UserService userService;
    
    /**
     * 获取所有班级
     */
    @GetMapping
    public ResponseEntity<?> getAllClasses() {
        List<ClassEntity> classes = classService.getClassesNotJoinedByStudent(null);
        return ResponseEntity.ok(classes);
    }
    
    /**
     * 创建新班级（仅限教师）
     */
    @PostMapping
    public ResponseEntity<?> createClass(
            @RequestBody ClassEntity classEntity,
            @RequestHeader("Authorization") String token) {
        try {
            // 检查并移除Bearer前缀
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            String[] parts = token.split("\\.");
            String username = parts[0];
            String role = parts[1];
            
            if (!role.equals("TEACHER")) {
                return ResponseEntity.badRequest().body("只有教师可以创建班级");
            }
            
            User teacher = userService.findByUsername(username);
            ClassEntity createdClass = classService.createClass(classEntity, teacher);
            
            return ResponseEntity.ok(createdClass);
        } catch (Exception e) {
            logger.severe("创建班级失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * 获取教师创建的班级
     */
    @GetMapping("/teacher")
    public ResponseEntity<?> getTeacherClasses(@RequestHeader("Authorization") String token) {
        try {
            // 检查并移除Bearer前缀
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            String[] parts = token.split("\\.");
            String username = parts[0];
            String role = parts[1];
            
            if (!role.equals("TEACHER")) {
                return ResponseEntity.badRequest().body("只有教师可以访问此接口");
            }
            
            User teacher = userService.findByUsername(username);
            List<ClassEntity> classes = classService.getTeacherClasses(teacher.getId());
            
            return ResponseEntity.ok(classes);
        } catch (Exception e) {
            logger.severe("获取教师班级失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * 获取学生已加入的班级
     */
    @GetMapping("/student/joined")
    public ResponseEntity<?> getStudentClasses(@RequestHeader("Authorization") String token) {
        try {
            // 检查并移除Bearer前缀
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            String[] parts = token.split("\\.");
            String username = parts[0];
            String role = parts[1];
            
            if (!role.equals("STUDENT")) {
                return ResponseEntity.badRequest().body("只有学生可以访问此接口");
            }
            
            User student = userService.findByUsername(username);
            List<ClassEntity> classes = classService.getStudentClasses(student);
            
            return ResponseEntity.ok(classes);
        } catch (Exception e) {
            logger.severe("获取学生班级失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * 获取学生未加入的班级
     */
    @GetMapping("/student/available")
    public ResponseEntity<?> getAvailableClasses(@RequestHeader("Authorization") String token) {
        try {
            logger.info("获取可用班级请求，token: " + token);
            // 检查并移除Bearer前缀
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            String[] parts = token.split("\\.");
            if (parts.length < 2) {
                logger.severe("无效的token格式: " + token);
                return ResponseEntity.badRequest().body("无效的认证信息");
            }
            
            String username = parts[0];
            String role = parts[1];
            
            logger.info("解析的用户名: " + username + ", 角色: " + role);
            
            if (!role.equals("STUDENT")) {
                return ResponseEntity.badRequest().body("只有学生可以访问此接口");
            }
            
            User student = userService.findByUsername(username);
            List<ClassEntity> classes = classService.getClassesNotJoinedByStudent(student.getId());
            
            return ResponseEntity.ok(classes);
        } catch (Exception e) {
            logger.severe("获取可用班级失败: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * 学生申请加入班级
     */
    @PostMapping("/{classId}/apply")
    public ResponseEntity<?> applyToJoinClass(
            @PathVariable Long classId,
            @RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String token) {
        try {
            logger.info("申请加入班级请求，token: " + token);
            // 检查并移除Bearer前缀
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            String[] parts = token.split("\\.");
            if (parts.length < 2) {
                logger.severe("无效的token格式: " + token);
                return ResponseEntity.badRequest().body("无效的认证信息");
            }
            
            String username = parts[0];
            String role = parts[1];
            
            logger.info("解析的用户名: " + username + ", 角色: " + role);
            
            if (!role.equals("STUDENT")) {
                return ResponseEntity.badRequest().body("只有学生可以申请加入班级");
            }
            
            User student = userService.findByUsername(username);
            String message = body.getOrDefault("message", "");
            
            ClassApplication application = classService.applyToJoinClass(student.getId(), classId, message);
            
            return ResponseEntity.ok(application);
        } catch (Exception e) {
            logger.severe("申请加入班级失败: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * 获取学生的申请历史
     */
    @GetMapping("/applications/student")
    public ResponseEntity<?> getStudentApplications(@RequestHeader("Authorization") String token) {
        try {
            logger.info("获取学生申请历史请求，token: " + token);
            // 检查并移除Bearer前缀
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            String[] parts = token.split("\\.");
            if (parts.length < 2) {
                logger.severe("无效的token格式: " + token);
                return ResponseEntity.badRequest().body("无效的认证信息");
            }
            
            String username = parts[0];
            String role = parts[1];
            
            logger.info("解析的用户名: " + username + ", 角色: " + role);
            
            if (!role.equals("STUDENT")) {
                return ResponseEntity.badRequest().body("只有学生可以访问此接口");
            }
            
            User student = userService.findByUsername(username);
            List<ClassApplication> applications = classService.getStudentApplications(student.getId());
            
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            logger.severe("获取学生申请历史失败: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * 获取教师需要处理的申请
     */
    @GetMapping("/applications/teacher")
    public ResponseEntity<?> getTeacherApplications(@RequestHeader("Authorization") String token) {
        try {
            // 检查并移除Bearer前缀
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            String[] parts = token.split("\\.");
            String username = parts[0];
            String role = parts[1];
            
            if (!role.equals("TEACHER")) {
                return ResponseEntity.badRequest().body("只有教师可以访问此接口");
            }
            
            User teacher = userService.findByUsername(username);
            List<ClassApplication> applications = classService.getPendingApplicationsForTeacher(teacher.getId());
            
            // 转换为包含学生姓名的响应
            List<Map<String, Object>> response = applications.stream().map(app -> {
                Map<String, Object> appData = new HashMap<>();
                appData.put("id", app.getId());
                appData.put("status", app.getStatus());
                appData.put("message", app.getMessage());
                appData.put("createdAt", app.getCreatedAt());
                
                Map<String, Object> studentData = new HashMap<>();
                studentData.put("id", app.getStudent().getId());
                studentData.put("name", app.getStudent().getName());
                studentData.put("username", app.getStudent().getUsername());
                
                Map<String, Object> classData = new HashMap<>();
                classData.put("id", app.getClassEntity().getId());
                classData.put("name", app.getClassEntity().getName());
                
                appData.put("student", studentData);
                appData.put("class", classData);
                
                return appData;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.severe("获取教师申请列表失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * 教师审批班级申请
     */
    @PostMapping("/applications/{applicationId}/process")
    public ResponseEntity<?> processApplication(
            @PathVariable Long applicationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader("Authorization") String token) {
        try {
            // 检查并移除Bearer前缀
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            String[] parts = token.split("\\.");
            String username = parts[0];
            String role = parts[1];
            
            if (!role.equals("TEACHER")) {
                return ResponseEntity.badRequest().body("只有教师可以处理申请");
            }
            
            User teacher = userService.findByUsername(username);
            String statusStr = (String) body.get("status");
            ApplicationStatus newStatus = ApplicationStatus.valueOf(statusStr);
            
            String rejectReason = "";
            if (newStatus == ApplicationStatus.REJECTED) {
                rejectReason = (String) body.getOrDefault("rejectReason", "");
            }
            
            ClassApplication application = classService.processApplication(
                    applicationId, newStatus, rejectReason, teacher.getId());
            
            return ResponseEntity.ok(application);
        } catch (Exception e) {
            logger.severe("处理班级申请失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * 学生取消班级申请
     */
    @DeleteMapping("/applications/{applicationId}")
    public ResponseEntity<?> cancelApplication(
            @PathVariable Long applicationId,
            @RequestHeader("Authorization") String token) {
        try {
            // 检查并移除Bearer前缀
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            String[] parts = token.split("\\.");
            String username = parts[0];
            String role = parts[1];
            
            if (!role.equals("STUDENT")) {
                return ResponseEntity.badRequest().body("只有学生可以取消申请");
            }
            
            User student = userService.findByUsername(username);
            classService.cancelApplication(applicationId, student.getId());
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "申请已取消");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.severe("取消班级申请失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * 获取班级详情
     */
    @GetMapping("/{classId}")
    public ResponseEntity<?> getClassById(@PathVariable Long classId) {
        try {
            ClassEntity classEntity = classService.getClassById(classId);
            return ResponseEntity.ok(classEntity);
        } catch (Exception e) {
            logger.severe("获取班级详情失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * 教师更新班级信息
     */
    @PutMapping("/{classId}")
    public ResponseEntity<?> updateClass(
            @PathVariable Long classId,
            @RequestBody ClassEntity updatedClass,
            @RequestHeader("Authorization") String token) {
        try {
            // 检查并移除Bearer前缀
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            String[] parts = token.split("\\.");
            String username = parts[0];
            String role = parts[1];
            
            if (!role.equals("TEACHER")) {
                return ResponseEntity.badRequest().body("只有教师可以更新班级");
            }
            
            User teacher = userService.findByUsername(username);
            ClassEntity classEntity = classService.updateClass(classId, updatedClass, teacher.getId());
            
            return ResponseEntity.ok(classEntity);
        } catch (Exception e) {
            logger.severe("更新班级信息失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * 教师移除班级学生
     */
    @DeleteMapping("/{classId}/students/{studentId}")
    public ResponseEntity<?> removeStudentFromClass(
            @PathVariable Long classId,
            @PathVariable Long studentId,
            @RequestHeader("Authorization") String token) {
        try {
            // 检查并移除Bearer前缀
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            String[] parts = token.split("\\.");
            String username = parts[0];
            String role = parts[1];
            
            if (!role.equals("TEACHER")) {
                return ResponseEntity.badRequest().body("只有教师可以移除学生");
            }
            
            User teacher = userService.findByUsername(username);
            classService.removeStudentFromClass(classId, studentId, teacher.getId());
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "学生已从班级中移除");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.severe("移除班级学生失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
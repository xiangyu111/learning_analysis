package com.example.learninganalysis.controller;

import com.example.learninganalysis.model.ClassEntity;
import com.example.learninganalysis.model.SystemLog;
import com.example.learninganalysis.model.User;
import com.example.learninganalysis.model.UserRole;
import com.example.learninganalysis.service.AdminService;
import com.example.learninganalysis.service.LogService;
import com.example.learninganalysis.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private static final Logger logger = Logger.getLogger(AdminController.class.getName());

    @Autowired
    private AdminService adminService;

    @Autowired
    private LogService logService;

    @Autowired
    private UserService userService;

    /**
     * 验证调用者是否具有管理员权限
     */
    private User validateAdmin(Authentication authentication) {
        if (authentication == null) {
            throw new RuntimeException("未登录");
        }

        User user = userService.findByUsername(authentication.getName());
        if (user.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("权限不足，需要管理员权限");
        }
        return user;
    }

    /**
     * 获取所有班级列表
     */
    @GetMapping("/classes")
    public ResponseEntity<?> getAllClasses(Authentication authentication) {
        try {
            validateAdmin(authentication);
            List<Map<String, Object>> classes = adminService.getAllClasses();
            return ResponseEntity.ok(classes);
        } catch (Exception e) {
            logger.warning("获取班级列表失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 获取班级详情
     */
    @GetMapping("/classes/{id}")
    public ResponseEntity<?> getClassDetail(@PathVariable Long id, Authentication authentication) {
        try {
            validateAdmin(authentication);
            Map<String, Object> classDetail = adminService.getClassDetail(id);
            return ResponseEntity.ok(classDetail);
        } catch (Exception e) {
            logger.warning("获取班级详情失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 创建班级
     */
    @PostMapping("/classes")
    public ResponseEntity<?> createClass(
            @RequestBody Map<String, Object> requestBody,
            Authentication authentication,
            HttpServletRequest request) {
        try {
            User admin = validateAdmin(authentication);
            
            // 从请求体中提取数据
            String name = (String) requestBody.get("name");
            String description = (String) requestBody.get("description");
            Long teacherId = Long.valueOf(requestBody.get("teacherId").toString());
            
            ClassEntity classEntity = new ClassEntity();
            classEntity.setName(name);
            classEntity.setDescription(description);
            
            String ipAddress = logService.getClientIpAddress(request);
            ClassEntity createdClass = adminService.createClass(classEntity, teacherId, ipAddress, admin);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", createdClass.getId());
            response.put("name", createdClass.getName());
            response.put("message", "班级创建成功");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.warning("创建班级失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 更新班级信息
     */
    @PutMapping("/classes/{id}")
    public ResponseEntity<?> updateClass(
            @PathVariable Long id,
            @RequestBody Map<String, Object> requestBody,
            Authentication authentication,
            HttpServletRequest request) {
        try {
            User admin = validateAdmin(authentication);
            
            // 从请求体中提取数据
            String name = (String) requestBody.get("name");
            String description = (String) requestBody.get("description");
            Long teacherId = null;
            if (requestBody.containsKey("teacherId")) {
                teacherId = Long.valueOf(requestBody.get("teacherId").toString());
            }
            
            ClassEntity classEntity = new ClassEntity();
            classEntity.setName(name);
            classEntity.setDescription(description);
            
            String ipAddress = logService.getClientIpAddress(request);
            ClassEntity updatedClass = adminService.updateClass(id, classEntity, teacherId, ipAddress, admin);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", updatedClass.getId());
            response.put("name", updatedClass.getName());
            response.put("message", "班级更新成功");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.warning("更新班级失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 获取所有教师列表
     */
    @GetMapping("/teachers")
    public ResponseEntity<?> getAllTeachers(Authentication authentication) {
        try {
            validateAdmin(authentication);
            List<Map<String, Object>> teachers = adminService.getAllTeachers();
            return ResponseEntity.ok(teachers);
        } catch (Exception e) {
            logger.warning("获取教师列表失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 获取未分配班级的教师列表
     */
    @GetMapping("/teachers/unassigned")
    public ResponseEntity<?> getUnassignedTeachers(Authentication authentication) {
        try {
            validateAdmin(authentication);
            List<Map<String, Object>> teachers = adminService.getUnassignedTeachers();
            return ResponseEntity.ok(teachers);
        } catch (Exception e) {
            logger.warning("获取未分配教师列表失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 查询系统日志
     */
    @GetMapping("/logs")
    public ResponseEntity<?> getLogs(
            @RequestParam(required = false) String operationType,
            @RequestParam(required = false) String userRole,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            Authentication authentication) {
        try {
            validateAdmin(authentication);
            
            UserRole role = null;
            if (userRole != null && !userRole.isEmpty()) {
                try {
                    role = UserRole.valueOf(userRole.toUpperCase());
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body("无效的用户角色");
                }
            }
            
            List<SystemLog> logs = logService.findLogs(operationType, role, startTime, endTime);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            logger.warning("查询系统日志失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 获取单条日志详情
     */
    @GetMapping("/logs/{id}")
    public ResponseEntity<?> getLogDetail(@PathVariable Long id, Authentication authentication) {
        try {
            validateAdmin(authentication);
            SystemLog log = logService.getLogById(id);
            return ResponseEntity.ok(log);
        } catch (Exception e) {
            logger.warning("获取日志详情失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 获取所有学生列表
     */
    @GetMapping("/students")
    public ResponseEntity<?> getAllStudents(Authentication authentication) {
        try {
            validateAdmin(authentication);
            List<Map<String, Object>> students = adminService.getAllStudents();
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            logger.warning("获取学生列表失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * 获取简化的班级列表（用于下拉选择等场景）
     */
    @GetMapping("/classes/simple")
    public ResponseEntity<?> getSimpleClasses(Authentication authentication) {
        try {
            validateAdmin(authentication);
            List<Map<String, Object>> classes = adminService.getSimpleClasses();
            return ResponseEntity.ok(classes);
        } catch (Exception e) {
            logger.warning("获取简化班级列表失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
} 
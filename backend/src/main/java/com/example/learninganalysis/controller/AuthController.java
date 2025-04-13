package com.example.learninganalysis.controller;

import com.example.learninganalysis.model.User;
import com.example.learninganalysis.model.UserRole;
import com.example.learninganalysis.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = Logger.getLogger(AuthController.class.getName());
    
    @Autowired
    private UserService userService;

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> register(
            @RequestParam(value = "username", required = false) String username,
            @RequestParam(value = "password", required = false) String password,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar) {
        try {
            // 添加详细的请求参数记录
            StringBuilder logMessage = new StringBuilder("收到注册请求，参数详情：\n");
            logMessage.append("username: ").append(username).append("\n");
            logMessage.append("password: ").append(password != null ? "已设置" : "未设置").append("\n");
            logMessage.append("name: ").append(name).append("\n");
            logMessage.append("email: ").append(email).append("\n");
            logMessage.append("role: ").append(role).append("\n");
            logMessage.append("avatar: ").append(avatar != null ? "已上传" : "未上传").append("\n");
            logger.info(logMessage.toString());
            
            // 参数验证和日志记录
            logger.info("参数验证: username=" + (username != null) + 
                       ", password=" + (password != null) + 
                       ", name=" + (name != null) + 
                       ", email=" + (email != null) + 
                       ", role=" + (role != null));
            
            if (username == null || password == null || name == null || email == null || role == null) {
                logger.warning("注册失败，必填字段为空: username=" + username + 
                              ", name=" + name + 
                              ", email=" + email + 
                              ", role=" + role);
                return ResponseEntity.badRequest().body("所有必填字段不能为空");
            }
            
            // 先检查用户名是否已存在
            if (userService.isUsernameExists(username)) {
                logger.warning("注册失败，用户名已存在: " + username);
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "用户名 '" + username + "' 已被注册，请选择其他用户名");
                errorResponse.put("field", "username");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // 检查邮箱是否已存在
            if (userService.isEmailExists(email)) {
                logger.warning("注册失败，邮箱已存在: " + email);
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "邮箱 '" + email + "' 已被注册，请使用其他邮箱地址");
                errorResponse.put("field", "email");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            User user = new User();
            user.setUsername(username);
            user.setPassword(password);
            user.setName(name);
            user.setEmail(email);
            
            try {
                UserRole userRole = UserRole.valueOf(role.toUpperCase());
                user.setRole(userRole);
                logger.info("成功解析用户角色: " + userRole);
            } catch (IllegalArgumentException e) {
                logger.warning("无效的用户角色: " + role);
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "无效的用户角色，有效值为: ADMIN, TEACHER, STUDENT");
                errorResponse.put("field", "role");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            if (avatar != null && !avatar.isEmpty()) {
                String fileExtension = StringUtils.getFilenameExtension(avatar.getOriginalFilename());
                String uniqueFilename = UUID.randomUUID().toString() + "." + fileExtension;
                
                // 使用File.separator确保跨平台兼容
                String uploadDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "avatars";
                File directory = new File(uploadDir);
                if (!directory.exists()) {
                    directory.mkdirs();
                }
                
                String filePath = uploadDir + File.separator + uniqueFilename;
                File dest = new File(filePath);
                avatar.transferTo(dest);
                
                // 保存头像相对路径
                user.setAvatarUrl("uploads/avatars/" + uniqueFilename);
                logger.info("头像已上传: " + filePath);
            } else {
                // 设置默认头像
                user.setAvatarUrl("/default-avatar.png");
                logger.info("使用默认头像");
            }

            User registeredUser = userService.registerUser(user);
            logger.info("用户注册成功: " + registeredUser.getUsername());
            
            // 创建返回对象
            Map<String, Object> response = new HashMap<>();
            response.put("id", registeredUser.getId());
            response.put("username", registeredUser.getUsername());
            response.put("name", registeredUser.getName());
            response.put("email", registeredUser.getEmail());
            response.put("role", registeredUser.getRole());
            response.put("message", "注册成功");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.severe("注册过程发生异常: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        try {
            logger.info("收到登录请求: " + loginRequest.getUsername());
            User user = userService.validateUserCredentials(loginRequest.getUsername(), loginRequest.getPassword());
            
            // 生成token (username.role.uuid)
            String token = String.format("%s.%s.%s", 
                user.getUsername(), 
                user.getRole(), 
                UUID.randomUUID().toString());
            
            logger.info("生成token成功，用户: " + user.getUsername() + ", 角色: " + user.getRole());
            
            // 创建返回对象
            Map<String, Object> response = new HashMap<>();
            Map<String, Object> userResponse = new HashMap<>();
            userResponse.put("id", user.getId());
            userResponse.put("username", user.getUsername());
            userResponse.put("name", user.getName());
            userResponse.put("email", user.getEmail());
            userResponse.put("role", user.getRole());
            
            // 添加头像URL，优先使用用户自定义头像
            if (user.getAvatarUrl() != null && !user.getAvatarUrl().isEmpty()) {
                userResponse.put("avatarUrl", user.getAvatarUrl());
            } else {
                userResponse.put("avatarUrl", "/assets/images/default-avatar.png");
            }
            
            response.put("user", userResponse);
            response.put("token", token);
            
            logger.info("登录成功，返回用户信息: " + user.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.warning("登录失败: " + e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String token) {
        try {
            // 简单返回成功即可，实际的token失效处理可以在前端完成
            Map<String, Object> response = new HashMap<>();
            response.put("message", "退出登录成功");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
} 
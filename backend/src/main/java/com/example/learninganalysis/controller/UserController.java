package com.example.learninganalysis.controller;

import com.example.learninganalysis.model.User;
import com.example.learninganalysis.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private static final Logger logger = Logger.getLogger(UserController.class.getName());
    
    @Autowired
    private UserService userService;
    
    /**
     * 更新用户资料
     */
    @PutMapping(value = "/{userId}/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProfile(
            @PathVariable Long userId,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar,
            @RequestHeader("Authorization") String token) {
        try {
            String[] parts = token.split("\\.");
            String username = parts[0];
            
            // 验证用户身份
            User user = userService.findByUsername(username);
            if (!user.getId().equals(userId)) {
                return ResponseEntity.badRequest().body("您无权修改此用户资料");
            }
            
            User updatedUser = new User();
            updatedUser.setName(name);
            updatedUser.setEmail(email);
            
            // 处理头像上传
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
                updatedUser.setAvatarUrl("uploads/avatars/" + uniqueFilename);
            }
            
            User result = userService.updateUserProfile(userId, updatedUser);
            
            // 创建完整的用户信息响应
            Map<String, Object> response = new HashMap<>();
            response.put("id", result.getId());
            response.put("username", result.getUsername());
            response.put("name", result.getName());
            response.put("email", result.getEmail());
            response.put("role", result.getRole());
            response.put("avatarUrl", result.getAvatarUrl() != null ? result.getAvatarUrl() : "/default-avatar.png");
            response.put("message", "个人资料更新成功");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.severe("更新用户资料失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * 修改密码
     */
    @PutMapping("/{userId}/password")
    public ResponseEntity<?> changePassword(
            @PathVariable Long userId,
            @RequestBody Map<String, String> passwordData,
            @RequestHeader("Authorization") String token) {
        try {
            String[] parts = token.split("\\.");
            String username = parts[0];
            
            // 验证用户身份
            User user = userService.findByUsername(username);
            if (!user.getId().equals(userId)) {
                return ResponseEntity.badRequest().body("您无权修改此用户密码");
            }
            
            String oldPassword = passwordData.get("oldPassword");
            String newPassword = passwordData.get("newPassword");
            
            if (oldPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body("新旧密码不能为空");
            }
            
            userService.changePassword(userId, oldPassword, newPassword);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "密码修改成功");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.severe("修改密码失败: " + e.getMessage());
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * 获取用户信息
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserInfo(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String token) {
        try {
            String[] parts = token.split("\\.");
            String username = parts[0];
            
            // 验证用户身份
            User requestUser = userService.findByUsername(username);
            User targetUser = userService.findById(userId);
            
            // 创建返回对象
            Map<String, Object> response = new HashMap<>();
            response.put("id", targetUser.getId());
            response.put("username", targetUser.getUsername());
            response.put("name", targetUser.getName());
            response.put("email", targetUser.getEmail());
            response.put("role", targetUser.getRole());
            response.put("avatarUrl", targetUser.getAvatarUrl());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.severe("获取用户信息失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
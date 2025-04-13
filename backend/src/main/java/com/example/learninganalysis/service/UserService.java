package com.example.learninganalysis.service;

import com.example.learninganalysis.model.*;
import com.example.learninganalysis.repository.ClassApplicationRepository;
import com.example.learninganalysis.repository.ClassRepository;
import com.example.learninganalysis.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private ClassRepository classRepository;
    
    @Autowired
    private ClassApplicationRepository classApplicationRepository;

    public boolean isUsernameExists(String username) {
        return userRepository.existsByUsername(username);
    }
    
    public boolean isEmailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    public User registerUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("邮箱已被注册");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
    }
    
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
    }

    public User validateUserCredentials(String username, String password) {
        User user = findByUsername(username);
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("密码错误");
        }
        return user;
    }
    
    /**
     * 处理学生班级分配（注册时选择了班级的情况）
     * 创建一个自动批准的申请
     */
    @Transactional
    public void processStudentClassAssignment(Long studentId, Long classId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("学生不存在"));
        
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("班级不存在"));
        
        // 如果学生不是学生角色，抛出异常
        if (student.getRole() != UserRole.STUDENT) {
            throw new RuntimeException("只有学生可以加入班级");
        }
        
        // 创建并自动批准申请
        ClassApplication application = new ClassApplication();
        application.setStudent(student);
        application.setClassEntity(classEntity);
        application.setMessage("注册时选择加入班级");
        application.setStatus(ApplicationStatus.APPROVED);
        application.setHandledAt(LocalDateTime.now());
        classApplicationRepository.save(application);
        
        // 将学生添加到班级
        classEntity.getStudents().add(student);
        classRepository.save(classEntity);
    }
    
    /**
     * 更新用户资料
     */
    public User updateUserProfile(Long userId, User updatedUser) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        // 更新基本信息
        if (updatedUser.getName() != null) {
            existingUser.setName(updatedUser.getName());
        }
        
        if (updatedUser.getEmail() != null) {
            // 检查邮箱是否已被其他用户使用
            if (userRepository.existsByEmailAndIdNot(updatedUser.getEmail(), userId)) {
                throw new RuntimeException("邮箱已被其他用户使用");
            }
            existingUser.setEmail(updatedUser.getEmail());
        }
        
        if (updatedUser.getAvatarUrl() != null) {
            existingUser.setAvatarUrl(updatedUser.getAvatarUrl());
        }
        
        return userRepository.save(existingUser);
    }
    
    /**
     * 修改密码
     */
    public User changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        // 验证旧密码
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("原密码错误");
        }
        
        // 设置新密码
        user.setPassword(passwordEncoder.encode(newPassword));
        return userRepository.save(user);
    }
}
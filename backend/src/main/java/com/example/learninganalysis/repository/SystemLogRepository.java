package com.example.learninganalysis.repository;

import com.example.learninganalysis.model.SystemLog;
import com.example.learninganalysis.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SystemLogRepository extends JpaRepository<SystemLog, Long> {
    
    // 根据操作类型查询日志
    List<SystemLog> findByOperationType(String operationType);
    
    // 根据用户角色查询日志
    List<SystemLog> findByUserRole(UserRole userRole);
    
    // 根据时间范围查询日志
    List<SystemLog> findByCreatedAtBetween(LocalDateTime startTime, LocalDateTime endTime);
    
    // 组合查询：根据操作类型和用户角色
    List<SystemLog> findByOperationTypeAndUserRole(String operationType, UserRole userRole);
    
    // 组合查询：根据操作类型和时间范围
    List<SystemLog> findByOperationTypeAndCreatedAtBetween(
            String operationType, LocalDateTime startTime, LocalDateTime endTime);
    
    // 组合查询：根据用户角色和时间范围
    List<SystemLog> findByUserRoleAndCreatedAtBetween(
            UserRole userRole, LocalDateTime startTime, LocalDateTime endTime);
    
    // 组合查询：根据操作类型、用户角色和时间范围
    List<SystemLog> findByOperationTypeAndUserRoleAndCreatedAtBetween(
            String operationType, UserRole userRole, LocalDateTime startTime, LocalDateTime endTime);
    
    // 根据用户ID查询日志
    List<SystemLog> findByUserId(Long userId);
} 
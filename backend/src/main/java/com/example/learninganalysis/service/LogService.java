package com.example.learninganalysis.service;

import com.example.learninganalysis.model.OperationType;
import com.example.learninganalysis.model.SystemLog;
import com.example.learninganalysis.model.User;
import com.example.learninganalysis.model.UserRole;
import com.example.learninganalysis.repository.SystemLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.logging.Logger;

@Service
public class LogService {
    private static final Logger logger = Logger.getLogger(LogService.class.getName());

    @Autowired
    private SystemLogRepository systemLogRepository;

    /**
     * 记录系统操作日志
     */
    public SystemLog createLog(OperationType operationType, String detail, User user, String ipAddress) {
        logger.info("创建系统日志: " + operationType + ", 用户: " + (user != null ? user.getUsername() : "未知"));
        
        SystemLog log = new SystemLog();
        log.setOperationType(operationType.name());
        log.setOperationDetail(detail);
        
        if (user != null) {
            log.setUser(user);
            log.setUserRole(user.getRole());
        }
        
        log.setIpAddress(ipAddress);
        
        return systemLogRepository.save(log);
    }

    /**
     * 获取客户端IP地址
     */
    public String getClientIpAddress(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        return ipAddress;
    }

    /**
     * 根据条件查询系统日志
     */
    public List<SystemLog> findLogs(String operationType, UserRole userRole, 
                                   LocalDateTime startTime, LocalDateTime endTime) {
        if (operationType != null && userRole != null && startTime != null && endTime != null) {
            return systemLogRepository.findByOperationTypeAndUserRoleAndCreatedAtBetween(
                    operationType, userRole, startTime, endTime);
        } else if (operationType != null && userRole != null) {
            return systemLogRepository.findByOperationTypeAndUserRole(operationType, userRole);
        } else if (operationType != null && startTime != null && endTime != null) {
            return systemLogRepository.findByOperationTypeAndCreatedAtBetween(
                    operationType, startTime, endTime);
        } else if (userRole != null && startTime != null && endTime != null) {
            return systemLogRepository.findByUserRoleAndCreatedAtBetween(
                    userRole, startTime, endTime);
        } else if (operationType != null) {
            return systemLogRepository.findByOperationType(operationType);
        } else if (userRole != null) {
            return systemLogRepository.findByUserRole(userRole);
        } else if (startTime != null && endTime != null) {
            return systemLogRepository.findByCreatedAtBetween(startTime, endTime);
        } else {
            return systemLogRepository.findAll();
        }
    }

    /**
     * 获取单条日志详情
     */
    public SystemLog getLogById(Long id) {
        return systemLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("日志记录不存在"));
    }
} 
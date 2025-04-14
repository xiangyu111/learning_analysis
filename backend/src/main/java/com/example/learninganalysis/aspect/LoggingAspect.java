package com.example.learninganalysis.aspect;

import com.example.learninganalysis.model.OperationType;
import com.example.learninganalysis.model.User;
import com.example.learninganalysis.service.LogService;
import com.example.learninganalysis.service.UserService;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.Map;
import java.util.logging.Logger;

@Aspect
@Component
public class LoggingAspect {
    private static final Logger logger = Logger.getLogger(LoggingAspect.class.getName());

    @Autowired
    private LogService logService;
    
    @Autowired
    private UserService userService;

    // 定义切点 - 所有控制器方法
    @Pointcut("execution(* com.example.learninganalysis.controller.*.*(..)) && !execution(* com.example.learninganalysis.controller.AuthController.login(..))")
    public void controllerMethods() {}

    // 登录操作切点
    @Pointcut("execution(* com.example.learninganalysis.controller.AuthController.login(..))")
    public void loginMethod() {}

    // 在登录成功后记录日志
    @AfterReturning(pointcut = "loginMethod()", returning = "result")
    public void logLoginOperation(JoinPoint joinPoint, Object result) {
        try {
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            Object[] args = joinPoint.getArgs();
            
            if (args.length > 0 && args[0] instanceof Map) {
                Map<String, String> loginData = (Map<String, String>) args[0];
                String username = loginData.get("username");
                
                if (username != null && !username.isEmpty()) {
                    User user = userService.findByUsername(username);
                    String ipAddress = logService.getClientIpAddress(request);
                    
                    logService.createLog(
                            OperationType.USER_LOGIN,
                            "用户登录成功: " + username,
                            user,
                            ipAddress
                    );
                }
            }
        } catch (Exception e) {
            logger.warning("记录登录日志失败: " + e.getMessage());
        }
    }

    // 控制器方法执行后记录日志
    @AfterReturning(pointcut = "controllerMethods()", returning = "result")
    public void logControllerAccess(JoinPoint joinPoint, Object result) {
        try {
            // 获取当前请求和认证信息
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                
                // 若未认证，不记录日志
                if (authentication == null || !authentication.isAuthenticated() || 
                        "anonymousUser".equals(authentication.getPrincipal())) {
                    return;
                }
                
                // 获取当前用户
                String username = authentication.getName();
                User user = userService.findByUsername(username);
                
                // 获取操作类型
                OperationType operationType = determineOperationType(request.getMethod(), joinPoint.getSignature().toString());
                
                // 若无法确定操作类型，不记录日志
                if (operationType == null) {
                    return;
                }
                
                // 构建操作详情
                String methodName = joinPoint.getSignature().getName();
                String className = joinPoint.getTarget().getClass().getSimpleName();
                String argsStr = Arrays.toString(joinPoint.getArgs());
                String detail = className + "." + methodName + ": " + argsStr;
                
                // 获取客户端IP
                String ipAddress = logService.getClientIpAddress(request);
                
                // 记录日志
                logService.createLog(operationType, detail, user, ipAddress);
            }
        } catch (Exception e) {
            logger.warning("记录操作日志失败: " + e.getMessage());
        }
    }
    
    // 根据HTTP方法和方法签名确定操作类型
    private OperationType determineOperationType(String httpMethod, String signature) {
        if (signature.contains("ClassController") || signature.contains("AdminController") && signature.contains("class")) {
            if ("POST".equals(httpMethod)) {
                return OperationType.CLASS_CREATE;
            } else if ("PUT".equals(httpMethod)) {
                return OperationType.CLASS_UPDATE;
            } else if ("DELETE".equals(httpMethod)) {
                return OperationType.CLASS_DELETE;
            }
        } else if (signature.contains("ActivityController")) {
            if ("POST".equals(httpMethod)) {
                return OperationType.ACTIVITY_CREATE;
            } else if ("PUT".equals(httpMethod)) {
                return OperationType.ACTIVITY_UPDATE;
            } else if ("DELETE".equals(httpMethod)) {
                return OperationType.ACTIVITY_DELETE;
            }
        } else if (signature.contains("UserController")) {
            if ("PUT".equals(httpMethod)) {
                return OperationType.USER_UPDATE;
            } else if ("DELETE".equals(httpMethod)) {
                return OperationType.USER_DELETE;
            }
        }
        
        // 为不能确定的操作返回null
        return null;
    }
} 
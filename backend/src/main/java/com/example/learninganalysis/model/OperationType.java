package com.example.learninganalysis.model;

public enum OperationType {
    // 用户相关操作
    USER_LOGIN,
    USER_LOGOUT,
    USER_REGISTER,
    USER_UPDATE,
    USER_DELETE,
    
    // 班级相关操作
    CLASS_CREATE,
    CLASS_UPDATE,
    CLASS_DELETE,
    CLASS_ADD_STUDENT,
    CLASS_REMOVE_STUDENT,
    
    // 活动相关操作
    ACTIVITY_CREATE,
    ACTIVITY_UPDATE,
    ACTIVITY_DELETE,
    ACTIVITY_PARTICIPATE,
    ACTIVITY_CANCEL,
    
    // 系统相关操作
    SYSTEM_CONFIG
} 
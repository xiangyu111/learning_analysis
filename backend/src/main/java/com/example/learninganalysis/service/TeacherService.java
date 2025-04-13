package com.example.learninganalysis.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.learninganalysis.repository.*;
import com.example.learninganalysis.model.*;
import java.util.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class TeacherService {
    private static final Logger logger = Logger.getLogger(TeacherService.class.getName());
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ActivityRepository activityRepository;
    
    @Autowired
    private StudentService studentService;

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private EvaluationRepository evaluationRepository;
    
    @Autowired
    private LearningGoalRepository learningGoalRepository;
    
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    // 添加Dashboard相关的方法
    public Map<String, Object> getDashboardStats(String username) {
        logger.info("获取教师仪表盘统计数据: " + username);
        
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("教师用户不存在"));
        
        Map<String, Object> stats = new HashMap<>();
        
        // 获取该教师管理的学生数量
        long studentCount = userRepository.countByRole(UserRole.STUDENT);
        stats.put("studentCount", studentCount);
        
        // 获取该教师创建的活动数量
        long activityCount = activityRepository.countByCreator(teacher);
        stats.put("activityCount", activityCount);
        
        // 学习目标数量
        long targetCount = learningGoalRepository.countByTeacher(teacher);
        stats.put("targetCount", targetCount);
        
        return stats;
    }
    
    public List<Map<String, Object>> getDashboardClasses(String username) {
        logger.info("获取教师仪表盘班级数据: " + username);
        
        // 这里应该使用真实数据库查询，暂时模拟数据
        List<Map<String, Object>> classes = new ArrayList<>();
        
        Map<String, Object> class1 = new HashMap<>();
        class1.put("id", 1);
        class1.put("name", "计算机科学1班");
        class1.put("studentCount", 35);
        class1.put("completionRate", 85);
        classes.add(class1);
        
        Map<String, Object> class2 = new HashMap<>();
        class2.put("id", 2);
        class2.put("name", "软件工程2班");
        class2.put("studentCount", 40);
        class2.put("completionRate", 76);
        classes.add(class2);
        
        Map<String, Object> class3 = new HashMap<>();
        class3.put("id", 3);
        class3.put("name", "人工智能实验班");
        class3.put("studentCount", 28);
        class3.put("completionRate", 92);
        classes.add(class3);
        
        return classes;
    }
    
    public List<Map<String, Object>> getDashboardTargets(String username) {
        logger.info("获取教师仪表盘目标数据: " + username);
        
        // 模拟学习目标数据
        List<Map<String, Object>> targets = new ArrayList<>();
        
        Map<String, Object> target1 = new HashMap<>();
        target1.put("id", 1);
        target1.put("title", "完成科技创新项目");
        target1.put("deadline", "2023-11-30");
        target1.put("affectedStudents", 35);
        target1.put("completionRate", 60);
        targets.add(target1);
        
        Map<String, Object> target2 = new HashMap<>();
        target2.put("id", 2);
        target2.put("title", "参加志愿服务活动");
        target2.put("deadline", "2023-10-31");
        target2.put("affectedStudents", 75);
        target2.put("completionRate", 85);
        targets.add(target2);
        
        Map<String, Object> target3 = new HashMap<>();
        target3.put("id", 3);
        target3.put("title", "撰写学术报告");
        target3.put("deadline", "2023-11-15");
        target3.put("affectedStudents", 28);
        target3.put("completionRate", 40);
        targets.add(target3);
        
        return targets;
    }
    
    public List<Map<String, Object>> getDashboardActivities(String username) {
        logger.info("获取教师仪表盘活动数据: " + username);
        
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("教师用户不存在"));
        
        // 获取该教师创建的最近活动
        List<Activity> activities = activityRepository.findTop3ByCreatorOrderByStartTimeDesc(teacher);
        
        if (activities.isEmpty()) {
            // 如果没有数据，返回模拟数据
            List<Map<String, Object>> mockData = new ArrayList<>();
            
            Map<String, Object> activity1 = new HashMap<>();
            activity1.put("id", 1);
            activity1.put("title", "科技创新大赛");
            activity1.put("type", "竞赛");
            activity1.put("date", "2023-10-15");
            activity1.put("participantsCount", 45);
            mockData.add(activity1);
            
            Map<String, Object> activity2 = new HashMap<>();
            activity2.put("id", 2);
            activity2.put("title", "志愿服务活动");
            activity2.put("type", "志愿服务");
            activity2.put("date", "2023-10-06");
            activity2.put("participantsCount", 30);
            mockData.add(activity2);
            
            Map<String, Object> activity3 = new HashMap<>();
            activity3.put("id", 3);
            activity3.put("title", "学术讲座：人工智能前沿");
            activity3.put("type", "讲座");
            activity3.put("date", "2023-10-10");
            activity3.put("participantsCount", 120);
            mockData.add(activity3);
            
            return mockData;
        }
        
        // 转换为前端需要的格式
        List<Map<String, Object>> activityMaps = new ArrayList<>();
        
        for (Activity activity : activities) {
            Map<String, Object> activityMap = new HashMap<>();
            activityMap.put("id", activity.getId());
            activityMap.put("title", activity.getTitle());
            activityMap.put("type", activity.getType().name());
            activityMap.put("date", activity.getStartTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
            activityMap.put("participantsCount", activity.getCurrentParticipants());
            activityMaps.add(activityMap);
        }
        
        return activityMaps;
    }

    public List<Map<String, Object>> getActivities(String username) {
        try {
            logger.info("获取所有活动列表: " + username);
            // 尝试使用StudentService的方法，因为老师可以看到所有活动
            return studentService.getActivities(username);
        } catch (Exception e) {
            logger.warning("获取活动列表失败，回退到模拟数据: " + e.getMessage());
            // 返回模拟数据供前端使用
            List<Map<String, Object>> mockData = new ArrayList<>();
            
            Map<String, Object> activity1 = new HashMap<>();
            activity1.put("id", 1);
            activity1.put("title", "科技创新大赛");
            activity1.put("type", "COMPETITION");
            activity1.put("location", "大学体育馆");
            activity1.put("startTime", "2023-10-01 08:00:00");
            activity1.put("endTime", "2023-10-15 18:00:00");
            activity1.put("status", "UPCOMING");
            activity1.put("maxParticipants", 100);
            activity1.put("currentParticipants", 45);
            activity1.put("organizer", "计算机科学学院");
            mockData.add(activity1);
            
            Map<String, Object> activity2 = new HashMap<>();
            activity2.put("id", 2);
            activity2.put("title", "志愿服务活动");
            activity2.put("type", "VOLUNTEER");
            activity2.put("location", "社区中心");
            activity2.put("startTime", "2023-10-05 09:00:00");
            activity2.put("endTime", "2023-10-06 17:00:00");
            activity2.put("status", "ONGOING");
            activity2.put("maxParticipants", 50);
            activity2.put("currentParticipants", 30);
            activity2.put("organizer", "学生会");
            mockData.add(activity2);
            
            Map<String, Object> activity3 = new HashMap<>();
            activity3.put("id", 3);
            activity3.put("title", "学术讲座：人工智能前沿");
            activity3.put("type", "LECTURE");
            activity3.put("location", "图书馆报告厅");
            activity3.put("startTime", "2023-10-10 14:00:00");
            activity3.put("endTime", "2023-10-10 16:00:00");
            activity3.put("status", "COMPLETED");
            activity3.put("maxParticipants", 200);
            activity3.put("currentParticipants", 120);
            activity3.put("organizer", "人工智能研究所");
            mockData.add(activity3);
            
            return mockData;
        }
    }
    
    public List<Map<String, Object>> getMyActivities(String username) {
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("教师用户不存在"));
        
        // 查询此教师创建的所有活动
        List<Activity> activities = activityRepository.findByCreator(teacher);
        List<Map<String, Object>> activityMaps = new ArrayList<>();
        
        for (Activity activity : activities) {
            activityMaps.add(convertActivityToMap(activity));
        }
        
        return activityMaps;
    }
    
    public List<Map<String, Object>> getActivitiesByType(String typeStr, String username) {
        return studentService.getActivitiesByType(typeStr, username);
    }
    
    public Map<String, Object> getActivityDetail(Long id, String username) {
        return studentService.getActivityDetail(id, username);
    }
    
    public Map<String, Object> createActivity(Map<String, Object> activityData, String username) {
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("教师用户不存在"));
        
        Activity activity = new Activity();
        
        // 设置基本信息
        activity.setTitle((String) activityData.get("title"));
        activity.setDescription((String) activityData.get("description"));
        activity.setLocation((String) activityData.get("location"));
        activity.setOrganizer((String) activityData.get("organizer"));
        activity.setMaxParticipants(((Number) activityData.get("maxParticipants")).intValue());
        activity.setCurrentParticipants(0);
        
        // 设置类型
        try {
            Activity.ActivityType type = Activity.ActivityType.valueOf((String) activityData.get("type"));
            activity.setType(type);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("无效的活动类型");
        }
        
        // 设置时间
        LocalDateTime startTime = LocalDateTime.parse((String) activityData.get("startTime"), formatter);
        LocalDateTime endTime = LocalDateTime.parse((String) activityData.get("endTime"), formatter);
        activity.setStartTime(startTime);
        activity.setEndTime(endTime);
        
        // 设置创建者
        activity.setCreator(teacher);
        
        // 保存活动
        Activity savedActivity = activityRepository.save(activity);
        
        return convertActivityToMap(savedActivity);
    }
    
    public Map<String, Object> updateActivity(Long id, Map<String, Object> activityData, String username) {
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("教师用户不存在"));
        
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("活动不存在"));
        
        // 检查是否是该活动的创建者
        if (activity.getCreator() != null && !activity.getCreator().equals(teacher)) {
            throw new RuntimeException("您无权修改此活动");
        }
        
        // 更新基本信息
        if (activityData.containsKey("title")) {
            activity.setTitle((String) activityData.get("title"));
        }
        
        if (activityData.containsKey("description")) {
            activity.setDescription((String) activityData.get("description"));
        }
        
        if (activityData.containsKey("location")) {
            activity.setLocation((String) activityData.get("location"));
        }
        
        if (activityData.containsKey("organizer")) {
            activity.setOrganizer((String) activityData.get("organizer"));
        }
        
        if (activityData.containsKey("maxParticipants")) {
            activity.setMaxParticipants(((Number) activityData.get("maxParticipants")).intValue());
        }
        
        // 更新类型
        if (activityData.containsKey("type")) {
            try {
                Activity.ActivityType type = Activity.ActivityType.valueOf((String) activityData.get("type"));
                activity.setType(type);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("无效的活动类型");
            }
        }
        
        // 更新时间
        if (activityData.containsKey("startTime") && activityData.containsKey("endTime")) {
            LocalDateTime startTime = LocalDateTime.parse((String) activityData.get("startTime"), formatter);
            LocalDateTime endTime = LocalDateTime.parse((String) activityData.get("endTime"), formatter);
            activity.setStartTime(startTime);
            activity.setEndTime(endTime);
        }
        
        // 保存更新
        Activity updatedActivity = activityRepository.save(activity);
        
        return convertActivityToMap(updatedActivity);
    }
    
    public Map<String, Object> deleteActivity(Long id, String username) {
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("教师用户不存在"));
        
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("活动不存在"));
        
        // 检查是否是该活动的创建者
        if (activity.getCreator() != null && !activity.getCreator().equals(teacher)) {
            throw new RuntimeException("您无权删除此活动");
        }
        
        // 保存结果信息
        Map<String, Object> result = new HashMap<>();
        result.put("id", id);
        result.put("title", activity.getTitle());
        result.put("deleted", true);
        
        // 删除活动
        activityRepository.delete(activity);
        
        return result;
    }
    
    private Map<String, Object> convertActivityToMap(Activity activity) {
        Map<String, Object> activityMap = new HashMap<>();
        activityMap.put("id", activity.getId());
        activityMap.put("title", activity.getTitle());
        activityMap.put("type", activity.getType().name());
        activityMap.put("description", activity.getDescription());
        activityMap.put("location", activity.getLocation());
        activityMap.put("startTime", activity.getStartTime().format(formatter));
        activityMap.put("endTime", activity.getEndTime().format(formatter));
        activityMap.put("status", activity.getStatus().name());
        activityMap.put("maxParticipants", activity.getMaxParticipants());
        activityMap.put("currentParticipants", activity.getCurrentParticipants());
        activityMap.put("organizer", activity.getOrganizer());
        
        if (activity.getCreator() != null) {
            activityMap.put("creatorName", activity.getCreator().getUsername());
        }
        
        return activityMap;
    }

    // 获取班级列表
    public List<Map<String, Object>> getClasses(String username) {
        logger.info("获取教师班级列表: " + username);
        
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("教师用户不存在"));
        
        // 查询该教师创建的所有班级
        List<ClassEntity> classes = classRepository.findByTeacherIdOrderByCreatedAtDesc(teacher.getId());
        
        if (classes.isEmpty()) {
            // 如果没有数据，返回模拟数据
            List<Map<String, Object>> mockData = new ArrayList<>();
            
            Map<String, Object> class1 = new HashMap<>();
            class1.put("id", 1);
            class1.put("name", "计算机科学1班");
            class1.put("studentCount", 35);
            class1.put("createdAt", "2023-09-01");
            class1.put("description", "2023级计算机科学与技术专业1班");
            mockData.add(class1);
            
            Map<String, Object> class2 = new HashMap<>();
            class2.put("id", 2);
            class2.put("name", "软件工程2班");
            class2.put("studentCount", 40);
            class2.put("createdAt", "2023-09-01");
            class2.put("description", "2023级软件工程专业2班");
            mockData.add(class2);
            
            Map<String, Object> class3 = new HashMap<>();
            class3.put("id", 3);
            class3.put("name", "人工智能实验班");
            class3.put("studentCount", 28);
            class3.put("createdAt", "2023-09-01");
            class3.put("description", "2023级人工智能实验班");
            mockData.add(class3);
            
            return mockData;
        }
        
        // 转换为前端需要的格式
        return classes.stream().map(cls -> {
            Map<String, Object> classMap = new HashMap<>();
            classMap.put("id", cls.getId());
            classMap.put("name", cls.getName());
            classMap.put("studentCount", cls.getStudents().size());
            classMap.put("createdAt", cls.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
            classMap.put("description", cls.getDescription());
            return classMap;
        }).collect(Collectors.toList());
    }
    
    // 获取学生列表
    public List<Map<String, Object>> getStudents(String username) {
        logger.info("服务层：获取学生列表: " + username);
        
        // 查询所有STUDENT角色的用户
        List<User> students = userRepository.findByRole(UserRole.STUDENT);
        List<Map<String, Object>> studentList = new ArrayList<>();
        
        if (students.isEmpty()) {
            // 如果没有数据，返回模拟数据
            Map<String, Object> student1 = new HashMap<>();
            student1.put("id", 1);
            student1.put("name", "张三");
            student1.put("username", "student1");
            student1.put("email", "zhang@example.com");
            student1.put("joinDate", "2023-09-01");
            student1.put("status", "active");
            studentList.add(student1);
            
            Map<String, Object> student2 = new HashMap<>();
            student2.put("id", 2);
            student2.put("name", "李四");
            student2.put("username", "student2");
            student2.put("email", "li@example.com");
            student2.put("joinDate", "2023-09-01");
            student2.put("status", "active");
            studentList.add(student2);
            
            Map<String, Object> student3 = new HashMap<>();
            student3.put("id", 3);
            student3.put("name", "王五");
            student3.put("username", "student3");
            student3.put("email", "wang@example.com");
            student3.put("joinDate", "2023-09-01");
            student3.put("status", "inactive");
            studentList.add(student3);
        } else {
            // 将用户对象转换为Map
            for (User student : students) {
                Map<String, Object> studentMap = new HashMap<>();
                studentMap.put("id", student.getId());
                studentMap.put("name", student.getName());
                studentMap.put("username", student.getUsername());
                studentMap.put("email", student.getEmail());
                // 这里的创建时间应该从数据库中获取，现在使用模拟数据
                studentMap.put("joinDate", "2023-09-01");
                studentMap.put("status", "active");
                studentList.add(studentMap);
            }
        }
        
        return studentList;
    }
    
    // 获取班级详情
    public Map<String, Object> getClassDetail(Long classId, String username) {
        logger.info("获取班级详情: " + classId + ", 教师: " + username);
        
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("教师用户不存在"));
        
        ClassEntity classObj = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("班级不存在"));
                
        // 检查权限，只有班级的创建者才能查看详情
        if (!classObj.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("没有权限查看此班级");
        }
        
        Map<String, Object> classDetail = new HashMap<>();
        classDetail.put("id", classObj.getId());
        classDetail.put("name", classObj.getName());
        classDetail.put("description", classObj.getDescription());
        classDetail.put("studentCount", classObj.getStudents().size());
        classDetail.put("createdAt", classObj.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        
        // 获取班级学生列表
        List<Map<String, Object>> students = classObj.getStudents().stream().map(student -> {
            Map<String, Object> studentMap = new HashMap<>();
            studentMap.put("id", student.getId());
            studentMap.put("name", student.getFullName());
            studentMap.put("username", student.getUsername());
            studentMap.put("email", student.getEmail());
            studentMap.put("joinDate", student.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
            studentMap.put("status", "active");
            return studentMap;
        }).collect(Collectors.toList());
        
        classDetail.put("students", students);
        
        return classDetail;
    }
    
    public Map<String, Object> createClass(Map<String, Object> classData, String username) {
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("教师用户不存在"));
        
        ClassEntity newClass = new ClassEntity();
        newClass.setName((String) classData.get("name"));
        newClass.setDescription((String) classData.get("description"));
        newClass.setTeacher(teacher);
        
        ClassEntity savedClass = classRepository.save(newClass);
        
        Map<String, Object> result = new HashMap<>();
        result.put("id", savedClass.getId());
        result.put("name", savedClass.getName());
        result.put("description", savedClass.getDescription());
        result.put("studentCount", 0);
        result.put("createdAt", savedClass.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        
        return result;
    }
    
    public Map<String, Object> updateClass(Long id, Map<String, Object> classData, String username) {
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("教师用户不存在"));
        
        ClassEntity classObj = classRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("班级不存在"));
        
        // 检查权限
        if (!classObj.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("没有权限更新此班级");
        }
        
        // 更新班级信息
        classObj.setName((String) classData.get("name"));
        classObj.setDescription((String) classData.get("description"));
        
        ClassEntity savedClass = classRepository.save(classObj);
        
        Map<String, Object> result = new HashMap<>();
        result.put("id", savedClass.getId());
        result.put("name", savedClass.getName());
        result.put("description", savedClass.getDescription());
        result.put("studentCount", savedClass.getStudents().size());
        result.put("createdAt", savedClass.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        
        return result;
    }
    
    public Map<String, Object> deleteClass(Long id, String username) {
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("教师用户不存在"));
        
        ClassEntity classObj = classRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("班级不存在"));
        
        // 检查权限
        if (!classObj.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("没有权限删除此班级");
        }
        
        // 执行删除
        classRepository.delete(classObj);
        
        Map<String, Object> result = new HashMap<>();
        result.put("id", id);
        result.put("message", "班级已成功删除");
        
        return result;
    }
    
    public Map<String, Object> addStudentToClass(Long classId, Long studentId, String username) {
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("教师用户不存在"));
        
        ClassEntity classObj = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("班级不存在"));
        
        // 检查权限
        if (!classObj.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("没有权限更新此班级");
        }
        
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("学生不存在"));
        
        // 检查学生角色
        if (student.getRole() != UserRole.STUDENT) {
            throw new RuntimeException("只能将学生角色的用户添加到班级");
        }
        
        // 添加学生到班级
        classObj.getStudents().add(student);
        classRepository.save(classObj);
        
        Map<String, Object> result = new HashMap<>();
        result.put("classId", classId);
        result.put("studentId", studentId);
        result.put("message", "学生已成功添加到班级");
        
        return result;
    }
    
    public Map<String, Object> removeStudentFromClass(Long classId, Long studentId, String username) {
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("教师用户不存在"));
        
        ClassEntity classObj = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("班级不存在"));
        
        // 检查权限
        if (!classObj.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("没有权限更新此班级");
        }
        
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("学生不存在"));
        
        // 从班级中移除学生
        classObj.getStudents().remove(student);
        classRepository.save(classObj);
        
        Map<String, Object> result = new HashMap<>();
        result.put("classId", classId);
        result.put("studentId", studentId);
        result.put("message", "学生已成功从班级中移除");
        
        return result;
    }
    
    // 学生评估相关方法
    public List<Map<String, Object>> getStudentEvaluations(Long studentId, String username) {
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("教师用户不存在"));
        
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("学生不存在"));
        
        // 获取该教师对该学生的所有评估
        List<Evaluation> evaluations = evaluationRepository.findByStudentAndTeacherOrderByCreatedAtDesc(student, teacher);
        
        // 如果没有评估记录，返回空列表
        if (evaluations.isEmpty()) {
            return new ArrayList<>();
        }
        
        // 转换为前端需要的格式
        return evaluations.stream().map(eval -> {
            Map<String, Object> evalMap = new HashMap<>();
            evalMap.put("id", eval.getId());
            evalMap.put("content", eval.getContent());
            evalMap.put("grade", eval.getGrade());
            evalMap.put("createdAt", eval.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
            evalMap.put("teacherName", eval.getTeacher().getFullName());
            return evalMap;
        }).collect(Collectors.toList());
    }
    
    public Map<String, Object> createEvaluation(Map<String, Object> evaluationData, String username) {
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("教师用户不存在"));
        
        // 获取学生ID
        Long studentId = Long.valueOf(evaluationData.get("studentId").toString());
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("学生不存在"));
        
        // 创建新评估
        Evaluation evaluation = new Evaluation();
        evaluation.setStudent(student);
        evaluation.setTeacher(teacher);
        evaluation.setContent((String) evaluationData.get("content"));
        evaluation.setGrade((String) evaluationData.get("grade"));
        
        Evaluation savedEvaluation = evaluationRepository.save(evaluation);
        
        // 返回结果
        Map<String, Object> result = new HashMap<>();
        result.put("id", savedEvaluation.getId());
        result.put("content", savedEvaluation.getContent());
        result.put("grade", savedEvaluation.getGrade());
        result.put("createdAt", savedEvaluation.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        result.put("teacherName", teacher.getFullName());
        
        return result;
    }
    
    public Map<String, Object> updateEvaluation(Long id, Map<String, Object> evaluationData, String username) {
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("教师用户不存在"));
        
        Evaluation evaluation = evaluationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("评估不存在"));
        
        // 检查权限
        if (!evaluation.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("没有权限更新此评估");
        }
        
        // 更新评估
        evaluation.setContent((String) evaluationData.get("content"));
        evaluation.setGrade((String) evaluationData.get("grade"));
        
        Evaluation savedEvaluation = evaluationRepository.save(evaluation);
        
        // 返回结果
        Map<String, Object> result = new HashMap<>();
        result.put("id", savedEvaluation.getId());
        result.put("content", savedEvaluation.getContent());
        result.put("grade", savedEvaluation.getGrade());
        result.put("createdAt", savedEvaluation.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        result.put("teacherName", teacher.getFullName());
        
        return result;
    }
    
    public Map<String, Object> deleteEvaluation(Long id, String username) {
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("教师用户不存在"));
        
        Evaluation evaluation = evaluationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("评估不存在"));
        
        // 检查权限
        if (!evaluation.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("没有权限删除此评估");
        }
        
        // 执行删除
        evaluationRepository.delete(evaluation);
        
        Map<String, Object> result = new HashMap<>();
        result.put("id", id);
        result.put("message", "评估已成功删除");
        
        return result;
    }
    
    public Map<String, Object> getStudentDetail(Long id, String username) {
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("教师用户不存在"));
        
        User student = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("学生不存在"));
        
        // 检查学生角色
        if (student.getRole() != UserRole.STUDENT) {
            throw new RuntimeException("请求的用户不是学生");
        }
        
        Map<String, Object> studentDetail = new HashMap<>();
        studentDetail.put("id", student.getId());
        studentDetail.put("name", student.getFullName());
        studentDetail.put("username", student.getUsername());
        studentDetail.put("email", student.getEmail());
        
        // 获取学生班级
        String className = "未分配班级";
        // 查询该学生所属的班级
        List<ClassEntity> classes = classRepository.findByStudentsContaining(student);
        if (!classes.isEmpty()) {
            // 取第一个班级名称
            className = classes.get(0).getName();
        }
        studentDetail.put("className", className);
        
        if (student.getCreatedAt() != null) {
            studentDetail.put("joinDate", student.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        } else {
            studentDetail.put("joinDate", "未知");
        }
        
        // 获取学生的评估记录
        List<Map<String, Object>> evaluations = getStudentEvaluations(id, username);
        studentDetail.put("evaluations", evaluations);
        
        // 获取学生的活动记录
        List<Map<String, Object>> activities = getStudentActivities(id, username);
        studentDetail.put("activities", activities);
        
        // 获取学生的学习目标
        List<Map<String, Object>> goals = getStudentGoals(id, username);
        studentDetail.put("goals", goals);
        
        return studentDetail;
    }

    // 获取学生活动记录
    public List<Map<String, Object>> getStudentActivities(Long studentId, String username) {
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("教师用户不存在"));
        
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("学生不存在"));
        
        // 这里应该检查teacher是否有权限查看这个学生的信息
        // 例如检查该学生是否在teacher的班级中
        
        // 获取学生的活动记录
        List<Map<String, Object>> activitiesList = new ArrayList<>();
        
        // 这里应该从数据库中获取学生的活动记录
        // 为了简化，返回一些模拟数据
        
        Map<String, Object> activity1 = new HashMap<>();
        activity1.put("id", 1);
        activity1.put("title", "科技创新大赛");
        activity1.put("type", "COMPETITION");
        activity1.put("startTime", "2023-10-01");
        activity1.put("endTime", "2023-10-15");
        activity1.put("status", "COMPLETED");
        activity1.put("participationStatus", "COMPLETED");
        activitiesList.add(activity1);
        
        Map<String, Object> activity2 = new HashMap<>();
        activity2.put("id", 2);
        activity2.put("title", "志愿服务活动");
        activity2.put("type", "VOLUNTEER");
        activity2.put("startTime", "2023-10-05");
        activity2.put("endTime", "2023-10-06");
        activity2.put("status", "COMPLETED");
        activity2.put("participationStatus", "COMPLETED");
        activitiesList.add(activity2);
        
        Map<String, Object> activity3 = new HashMap<>();
        activity3.put("id", 3);
        activity3.put("title", "学术讲座：人工智能前沿");
        activity3.put("type", "LECTURE");
        activity3.put("startTime", "2023-10-10");
        activity3.put("endTime", "2023-10-10");
        activity3.put("status", "COMPLETED");
        activity3.put("participationStatus", "REGISTERED");
        activitiesList.add(activity3);
        
        return activitiesList;
    }
    
    // 获取教师创建的所有学习目标
    public List<Map<String, Object>> getGoals(String username) {
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("教师用户不存在"));
        
        // 从数据库中获取与教师相关的学习目标
        List<LearningGoal> goals = learningGoalRepository.findByTeacherOrderByCreatedAtDesc(teacher);
        
        // 转换为前端需要的格式
        List<Map<String, Object>> goalsList = new ArrayList<>();
        
        for (LearningGoal goal : goals) {
            Map<String, Object> goalMap = new HashMap<>();
            goalMap.put("id", goal.getId());
            goalMap.put("title", goal.getTitle());
            goalMap.put("description", goal.getDescription());
            
            // 格式化日期
            if (goal.getDueDate() != null) {
                goalMap.put("deadline", goal.getDueDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
            } else {
                goalMap.put("deadline", null);
            }
            
            goalMap.put("status", goal.getStatus().name());
            goalMap.put("progress", goal.getProgress());
            
            // 分配的学生数量，这里假设一个学习目标只分配给一个学生
            // 如果实际系统中一个学习目标可以分配给多个学生，则需要调整这部分逻辑
            goalMap.put("assignedStudents", 1);
            
            goalsList.add(goalMap);
        }
        
        return goalsList;
    }
    
    // 获取指定学习目标的详情
    public Map<String, Object> getGoalDetail(Long id, String username) {
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("教师用户不存在"));
        
        // 从数据库中获取学习目标详情
        LearningGoal goal = learningGoalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("学习目标不存在"));
        
        // 检查权限，只有目标的创建者才能查看详情
        if (!goal.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("没有权限查看此学习目标");
        }
        
        // 转换为前端需要的格式
        Map<String, Object> goalDetail = new HashMap<>();
        goalDetail.put("id", goal.getId());
        goalDetail.put("title", goal.getTitle());
        goalDetail.put("description", goal.getDescription());
        
        // 格式化日期
        if (goal.getDueDate() != null) {
            goalDetail.put("deadline", goal.getDueDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        } else {
            goalDetail.put("deadline", null);
        }
        
        goalDetail.put("status", goal.getStatus().name());
        goalDetail.put("progress", goal.getProgress());
        
        if (goal.getCreatedAt() != null) {
            goalDetail.put("createdAt", goal.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        }
        
        if (goal.getUpdatedAt() != null) {
            goalDetail.put("updatedAt", goal.getUpdatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        }
        
        goalDetail.put("teacherId", goal.getTeacher().getId());
        goalDetail.put("teacherName", goal.getTeacher().getFullName());
        
        // 获取被分配到此目标的学生信息
        Map<String, Object> studentInfo = new HashMap<>();
        studentInfo.put("id", goal.getStudent().getId());
        studentInfo.put("name", goal.getStudent().getFullName());
        studentInfo.put("progress", goal.getProgress());
        
        List<Map<String, Object>> assignedStudents = new ArrayList<>();
        assignedStudents.add(studentInfo);
        
        goalDetail.put("assignedStudents", assignedStudents);
        goalDetail.put("totalAssigned", assignedStudents.size());
        
        return goalDetail;
    }
    
    // 创建学习目标
    public Map<String, Object> createGoal(Map<String, Object> goalData, String username) {
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("教师用户不存在"));
        
        // 获取学生ID，因为每个目标都需要分配给一个学生
        Long studentId = Long.valueOf(goalData.get("studentId").toString());
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("学生不存在"));
        
        // 创建新的学习目标
        LearningGoal goal = new LearningGoal();
        goal.setTitle((String) goalData.get("title"));
        goal.setDescription((String) goalData.get("description"));
        
        // 设置截止日期
        String deadlineStr = (String) goalData.get("deadline");
        if (deadlineStr != null && !deadlineStr.isEmpty()) {
            LocalDateTime deadline = LocalDateTime.parse(deadlineStr + "T23:59:59");
            goal.setDueDate(deadline);
        }
        
        // 设置初始状态和进度
        goal.setStatus(LearningGoal.GoalStatus.IN_PROGRESS);
        goal.setProgress(0);
        
        // 设置教师和学生
        goal.setTeacher(teacher);
        goal.setStudent(student);
        
        // 保存到数据库
        LearningGoal savedGoal = learningGoalRepository.save(goal);
        
        // 返回创建成功的结果
        Map<String, Object> result = new HashMap<>();
        result.put("id", savedGoal.getId());
        result.put("title", savedGoal.getTitle());
        result.put("description", savedGoal.getDescription());
        
        if (savedGoal.getDueDate() != null) {
            result.put("deadline", savedGoal.getDueDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        } else {
            result.put("deadline", null);
        }
        
        result.put("status", savedGoal.getStatus().name());
        result.put("progress", savedGoal.getProgress());
        result.put("teacherId", teacher.getId());
        result.put("teacherName", teacher.getFullName());
        result.put("studentId", student.getId());
        result.put("studentName", student.getFullName());
        
        if (savedGoal.getCreatedAt() != null) {
            result.put("createdAt", savedGoal.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        }
        
        result.put("message", "学习目标创建成功");
        
        return result;
    }
    
    // 更新学习目标
    public Map<String, Object> updateGoal(Long id, Map<String, Object> goalData, String username) {
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("教师用户不存在"));
        
        // 从数据库中获取学习目标
        LearningGoal goal = learningGoalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("学习目标不存在"));
        
        // 检查权限，只有目标的创建者才能更新
        if (!goal.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("没有权限更新此学习目标");
        }
        
        // 更新基本信息
        if (goalData.containsKey("title")) {
            goal.setTitle((String) goalData.get("title"));
        }
        
        if (goalData.containsKey("description")) {
            goal.setDescription((String) goalData.get("description"));
        }
        
        // 更新截止日期
        if (goalData.containsKey("deadline")) {
            String deadlineStr = (String) goalData.get("deadline");
            if (deadlineStr != null && !deadlineStr.isEmpty()) {
                LocalDateTime deadline = LocalDateTime.parse(deadlineStr + "T23:59:59");
                goal.setDueDate(deadline);
            } else {
                goal.setDueDate(null);
            }
        }
        
        // 更新状态
        if (goalData.containsKey("status")) {
            try {
                LearningGoal.GoalStatus status = LearningGoal.GoalStatus.valueOf((String) goalData.get("status"));
                goal.setStatus(status);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("无效的目标状态");
            }
        }
        
        // 更新进度
        if (goalData.containsKey("progress")) {
            goal.setProgress(((Number) goalData.get("progress")).intValue());
        }
        
        // 保存更新
        LearningGoal updatedGoal = learningGoalRepository.save(goal);
        
        // 返回更新成功的结果
        Map<String, Object> result = new HashMap<>();
        result.put("id", updatedGoal.getId());
        result.put("title", updatedGoal.getTitle());
        result.put("description", updatedGoal.getDescription());
        
        if (updatedGoal.getDueDate() != null) {
            result.put("deadline", updatedGoal.getDueDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        } else {
            result.put("deadline", null);
        }
        
        result.put("status", updatedGoal.getStatus().name());
        result.put("progress", updatedGoal.getProgress());
        result.put("teacherId", teacher.getId());
        result.put("teacherName", teacher.getFullName());
        
        if (updatedGoal.getUpdatedAt() != null) {
            result.put("updatedAt", updatedGoal.getUpdatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        }
        
        result.put("message", "学习目标更新成功");
        
        return result;
    }
    
    // 删除学习目标
    public Map<String, Object> deleteGoal(Long id, String username) {
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("教师用户不存在"));
        
        // 从数据库中获取学习目标
        LearningGoal goal = learningGoalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("学习目标不存在"));
        
        // 检查权限，只有目标的创建者才能删除
        if (!goal.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("没有权限删除此学习目标");
        }
        
        // 保存结果信息
        Map<String, Object> result = new HashMap<>();
        result.put("id", id);
        result.put("deleted", true);
        result.put("message", "学习目标已成功删除");
        
        // 执行删除
        learningGoalRepository.delete(goal);
        
        return result;
    }
    
    // 获取特定学生的学习目标
    public List<Map<String, Object>> getStudentGoals(Long studentId, String username) {
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("教师用户不存在"));
        
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("学生不存在"));
        
        // 查询该学生的所有学习目标
        List<LearningGoal> goals = learningGoalRepository.findByStudentOrderByCreatedAtDesc(student);
        
        // 转换为前端需要的格式
        List<Map<String, Object>> goalsList = new ArrayList<>();
        
        for (LearningGoal goal : goals) {
            // 检查教师权限，只展示该教师创建的目标
            if (goal.getTeacher().getId().equals(teacher.getId())) {
                Map<String, Object> goalMap = new HashMap<>();
                goalMap.put("id", goal.getId());
                goalMap.put("title", goal.getTitle());
                goalMap.put("description", goal.getDescription());
                
                // 格式化日期
                if (goal.getDueDate() != null) {
                    goalMap.put("deadline", goal.getDueDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
                } else {
                    goalMap.put("deadline", null);
                }
                
                goalMap.put("status", goal.getStatus().name());
                goalMap.put("progress", goal.getProgress());
                
                goalsList.add(goalMap);
            }
        }
        
        return goalsList;
    }
} 
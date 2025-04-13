package com.example.learninganalysis.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.learninganalysis.repository.*;
import com.example.learninganalysis.model.*;
import java.util.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import com.example.learninganalysis.model.Activity.ActivityStatus;

@Service
public class StudentService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ActivityRepository activityRepository;
    
    @Autowired
    private ActivityParticipationRepository participationRepository;
    
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public List<Map<String, Object>> getGoals(String username) {
        // 临时返回模拟数据
        List<Map<String, Object>> goals = new ArrayList<>();
        Map<String, Object> goal1 = new HashMap<>();
        goal1.put("id", 1);
        goal1.put("title", "完成Java核心技术学习");
        goal1.put("description", "学习Java核心技术，包括语法、面向对象、集合等");
        goal1.put("deadline", "2023-12-31");
        goal1.put("status", "pending");
        goal1.put("progress", 60);
        goals.add(goal1);
        
        Map<String, Object> goal2 = new HashMap<>();
        goal2.put("id", 2);
        goal2.put("title", "参与技术讲座");
        goal2.put("description", "参与至少3次技术讲座或工作坊");
        goal2.put("deadline", "2023-11-30");
        goal2.put("status", "pending");
        goal2.put("progress", 30);
        goals.add(goal2);
        
        return goals;
    }

    public List<Map<String, Object>> getActivities(String username) {
        // 获取所有活动
        List<Activity> activities = activityRepository.findAllByOrderByStartTimeDesc();
        
        // 获取用户信息
        User user = userRepository.findByUsername(username).orElse(null);
        
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Activity activity : activities) {
            Map<String, Object> activityMap = convertActivityToMap(activity);
            
            // 如果用户存在，查询用户参与情况
            if (user != null) {
                Optional<ActivityParticipation> participation = 
                    participationRepository.findByUserAndActivity(user, activity);
                
                if (participation.isPresent()) {
                    activityMap.put("participationStatus", participation.get().getStatus().name());
                }
            }
            
            result.add(activityMap);
        }
        
        return result;
    }
    
    public List<Map<String, Object>> getMyActivities(String username) {
        // 获取用户
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        // 获取用户参与的活动
        List<ActivityParticipation> participations = participationRepository.findByUser(user);
        
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (ActivityParticipation participation : participations) {
            Map<String, Object> activityMap = convertActivityToMap(participation.getActivity());
            activityMap.put("participationStatus", participation.getStatus().name());
            result.add(activityMap);
        }
        
        return result;
    }
    
    public List<Map<String, Object>> getActivitiesByType(String typeStr, String username) {
        Activity.ActivityType type;
        try {
            type = Activity.ActivityType.valueOf(typeStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("不支持的活动类型: " + typeStr);
        }
        
        // 获取指定类型的活动
        List<Activity> activities = activityRepository.findByTypeOrderByStartTimeDesc(type);
        
        // 获取用户信息
        User user = userRepository.findByUsername(username).orElse(null);
        
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Activity activity : activities) {
            Map<String, Object> activityMap = convertActivityToMap(activity);
            
            // 如果用户存在，查询用户参与情况
            if (user != null) {
                Optional<ActivityParticipation> participation = 
                    participationRepository.findByUserAndActivity(user, activity);
                
                if (participation.isPresent()) {
                    activityMap.put("participationStatus", participation.get().getStatus().name());
                }
            }
            
            result.add(activityMap);
        }
        
        return result;
    }
    
    public Map<String, Object> registerActivity(Long id, String username) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("活动不存在: " + id));
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        // 检查活动是否已结束
        if (activity.getStatus() == ActivityStatus.COMPLETED) {
            throw new RuntimeException("活动已结束，无法报名");
        }
        
        // 检查活动是否已满
        if (activity.getCurrentParticipants() >= activity.getMaxParticipants()) {
            throw new RuntimeException("活动报名已满");
        }
        
        // 检查用户是否已报名
        Optional<ActivityParticipation> existingParticipation = 
            participationRepository.findByUserAndActivity(user, activity);
        
        if (existingParticipation.isPresent() && 
            existingParticipation.get().getStatus() == ParticipationStatus.REGISTERED) {
            throw new RuntimeException("您已报名此活动");
        }
        
        // 创建新的参与记录
        ActivityParticipation participation = new ActivityParticipation();
        participation.setUser(user);
        participation.setActivity(activity);
        participation.setStatus(ParticipationStatus.REGISTERED);
        participation.setRegisterTime(LocalDateTime.now());
        
        participationRepository.save(participation);
        
        // 更新活动参与人数
        activity.setCurrentParticipants(activity.getCurrentParticipants() + 1);
        activityRepository.save(activity);
        
        // 返回更新后的活动信息
        Map<String, Object> result = convertActivityToMap(activity);
        result.put("participationStatus", ParticipationStatus.REGISTERED.name());
        
        return result;
    }
    
    public Map<String, Object> cancelActivity(Long id, String username) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("活动不存在: " + id));
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        // 查找用户的参与记录
        ActivityParticipation participation = participationRepository.findByUserAndActivity(user, activity)
                .orElseThrow(() -> new RuntimeException("您未报名此活动"));
        
        // 检查状态是否为已报名
        if (participation.getStatus() != ParticipationStatus.REGISTERED) {
            throw new RuntimeException("只能取消处于已报名状态的活动");
        }
        
        // 更新参与状态
        participation.setStatus(ParticipationStatus.CANCELLED);
        participation.setCancelTime(LocalDateTime.now());
        participationRepository.save(participation);
        
        // 更新活动参与人数
        if (activity.getCurrentParticipants() > 0) {
            activity.setCurrentParticipants(activity.getCurrentParticipants() - 1);
            activityRepository.save(activity);
        }
        
        // 返回更新后的活动信息
        Map<String, Object> result = convertActivityToMap(activity);
        result.put("participationStatus", ParticipationStatus.CANCELLED.name());
        
        return result;
    }
    
    public Map<String, Object> completeActivity(Long id, String username) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("活动不存在: " + id));
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        // 查找用户的参与记录
        ActivityParticipation participation = participationRepository.findByUserAndActivity(user, activity)
                .orElseThrow(() -> new RuntimeException("您未报名此活动"));
        
        // 检查状态是否为已报名
        if (participation.getStatus() != ParticipationStatus.REGISTERED) {
            throw new RuntimeException("只能完成处于已报名状态的活动");
        }
        
        // 检查活动是否已结束
        if (activity.getStatus() != ActivityStatus.COMPLETED) {
            throw new RuntimeException("只能完成已结束的活动");
        }
        
        // 更新参与状态
        participation.setStatus(ParticipationStatus.COMPLETED);
        participation.setCompleteTime(LocalDateTime.now());
        participationRepository.save(participation);
        
        // 返回更新后的活动信息
        Map<String, Object> result = convertActivityToMap(activity);
        result.put("participationStatus", ParticipationStatus.COMPLETED.name());
        
        return result;
    }

    public Map<String, Object> getStats(String username) {
        // 临时返回模拟数据
        Map<String, Object> stats = new HashMap<>();
        stats.put("goalCompletionRate", 45);
        stats.put("activityParticipationRate", 80);
        return stats;
    }

    public List<Map<String, Object>> getLearningPaths(String username) {
        // 临时返回模拟数据
        List<Map<String, Object>> paths = new ArrayList<>();
        Map<String, Object> path1 = new HashMap<>();
        path1.put("id", 1);
        path1.put("title", "Java全栈开发路径");
        path1.put("description", "从Java基础到企业级应用开发的完整学习路径");
        path1.put("progress", 40);
        path1.put("goals", getGoals(username));
        path1.put("activities", getActivities(username));
        paths.add(path1);

        return paths;
    }

    public Map<String, Object> getActivityDetail(Long id, String username) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("活动不存在: " + id));
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        Map<String, Object> activityMap = convertActivityToMap(activity);
        
        // 查询用户是否已参与此活动
        Optional<ActivityParticipation> participation = 
            participationRepository.findByUserAndActivity(user, activity);
        
        if (participation.isPresent()) {
            activityMap.put("participationStatus", participation.get().getStatus().name());
        }
        
        return activityMap;
    }

    public Map<String, Object> submitActivity(Long id, String username) {
        // 临时返回模拟数据
        Map<String, Object> result = new HashMap<>();
        result.put("id", id);
        result.put("status", "SUBMITTED");
        result.put("submissionDate", new Date());
        return result;
    }

    public Map<String, Object> submitFeedback(Map<String, String> feedback, String username) {
        // 临时返回模拟数据
        Map<String, Object> result = new HashMap<>();
        result.put("id", new Random().nextInt(1000));
        result.put("status", "SUBMITTED");
        result.put("submissionDate", new Date());
        return result;
    }

    // 将Activity实体转为Map，便于前端使用
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
} 
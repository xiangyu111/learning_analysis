package com.example.learninganalysis.repository;

import com.example.learninganalysis.model.Activity;
import com.example.learninganalysis.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    // 按类型查询活动
    List<Activity> findByType(Activity.ActivityType type);
    
    // 按开始时间查询活动
    List<Activity> findByStartTimeBetween(LocalDateTime startTime, LocalDateTime endTime);
    
    // 按类型和开始时间查询活动
    List<Activity> findByTypeAndStartTimeBetween(Activity.ActivityType type, LocalDateTime startTime, LocalDateTime endTime);
    
    // 按组织者查询活动
    List<Activity> findByOrganizer(String organizer);
    
    // 按创建者查询活动
    List<Activity> findByCreator(User creator);
    
    // 计算教师创建的活动总数
    long countByCreator(User creator);
    
    // 获取教师最新创建的三个活动
    List<Activity> findTop3ByCreatorOrderByStartTimeDesc(User creator);
    
    // 根据状态查询活动
    List<Activity> findByStatus(String status);
    
    // 使用自定义SQL查询包含完整信息的活动
    @Query("SELECT a FROM Activity a LEFT JOIN FETCH a.creator WHERE a.id = :id")
    Activity findActivityWithCreator(@Param("id") Long id);
    
    // 查询开始时间最新的几个活动
    List<Activity> findTop5ByOrderByStartTimeDesc();
    
    // 按开始时间倒序查询所有活动
    List<Activity> findAllByOrderByStartTimeDesc();
    
    // 按类型和开始时间倒序查询活动
    List<Activity> findByTypeOrderByStartTimeDesc(Activity.ActivityType type);
    
    // 使用原生SQL查询所有活动，避免可能的枚举映射错误
    @Query(value = "SELECT * FROM activities", nativeQuery = true)
    List<Activity> findAllActivitiesNative();
}
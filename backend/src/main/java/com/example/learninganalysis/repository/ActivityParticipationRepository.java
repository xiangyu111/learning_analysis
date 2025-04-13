package com.example.learninganalysis.repository;

import com.example.learninganalysis.model.Activity;
import com.example.learninganalysis.model.ActivityParticipation;
import com.example.learninganalysis.model.ParticipationStatus;
import com.example.learninganalysis.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ActivityParticipationRepository extends JpaRepository<ActivityParticipation, Long> {
    // 查询用户所有的活动参与记录
    List<ActivityParticipation> findByUser(User user);
    
    // 查询用户指定状态的活动参与记录
    List<ActivityParticipation> findByUserAndStatus(User user, ParticipationStatus status);
    
    // 查询活动的所有参与记录
    List<ActivityParticipation> findByActivity(Activity activity);
    
    // 查询活动的指定状态的参与记录
    List<ActivityParticipation> findByActivityAndStatus(Activity activity, ParticipationStatus status);
    
    // 查询用户是否参与了某个活动
    Optional<ActivityParticipation> findByUserAndActivity(User user, Activity activity);
    
    // 查询用户参与的所有活动（详细信息）
    @Query("SELECT ap FROM ActivityParticipation ap JOIN FETCH ap.activity WHERE ap.user = :user")
    List<ActivityParticipation> findByUserWithActivityDetails(@Param("user") User user);
    
    // 计算活动的参与人数
    @Query("SELECT COUNT(ap) FROM ActivityParticipation ap WHERE ap.activity = :activity AND ap.status = 'REGISTERED'")
    int countRegisteredParticipants(@Param("activity") Activity activity);
} 
package com.example.learninganalysis.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "activity_participations")
public class ActivityParticipation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "activity_id", nullable = false)
    private Activity activity;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ParticipationStatus status; // REGISTERED, COMPLETED, CANCELLED
    
    @Column(name = "register_time")
    private LocalDateTime registerTime;
    
    @Column(name = "complete_time")
    private LocalDateTime completeTime;
    
    @Column(name = "cancel_time")
    private LocalDateTime cancelTime;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        
        // 设置注册时间
        if (status == ParticipationStatus.REGISTERED && registerTime == null) {
            registerTime = LocalDateTime.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        
        // 根据状态更新相应的时间
        if (status == ParticipationStatus.COMPLETED && completeTime == null) {
            completeTime = LocalDateTime.now();
        } else if (status == ParticipationStatus.CANCELLED && cancelTime == null) {
            cancelTime = LocalDateTime.now();
        }
    }
} 
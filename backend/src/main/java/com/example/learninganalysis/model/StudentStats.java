package com.example.learninganalysis.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "student_stats")
public class StudentStats {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(name = "goal_completion_rate")
    private Double goalCompletionRate;

    @Column(name = "activity_participation_rate")
    private Double activityParticipationRate;

    @Column(name = "total_goals")
    private Integer totalGoals;

    @Column(name = "completed_goals")
    private Integer completedGoals;

    @Column(name = "total_activities")
    private Integer totalActivities;

    @Column(name = "participated_activities")
    private Integer participatedActivities;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
} 
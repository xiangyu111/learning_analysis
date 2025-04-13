package com.example.learninganalysis.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role; // STUDENT, TEACHER, ADMIN

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String email;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @OneToMany(mappedBy = "student")
    private List<LearningGoal> goals;

    @OneToMany(mappedBy = "teacher")
    private List<LearningActivity> activities;

    @OneToOne(mappedBy = "student")
    private StudentStats stats;

    @OneToMany(mappedBy = "teacher")
    private List<LearningPath> learningPaths;

    @OneToMany(mappedBy = "student")
    private List<Feedback> sentFeedbacks;

    @OneToMany(mappedBy = "teacher")
    private List<Feedback> receivedFeedbacks;

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
    
    // 获取用户全名
    public String getFullName() {
        return this.name;
    }
} 
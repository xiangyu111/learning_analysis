package com.example.learninganalysis.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.learninganalysis.service.StudentService;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
public class StudentController {
    
    @Autowired
    private StudentService studentService;

    @GetMapping("/goals")
    public ResponseEntity<?> getGoals(Authentication authentication) {
        try {
            return ResponseEntity.ok(studentService.getGoals(authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/activities")
    public ResponseEntity<?> getActivities(Authentication authentication) {
        try {
            return ResponseEntity.ok(studentService.getActivities(authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/activities/my")
    public ResponseEntity<?> getMyActivities(Authentication authentication) {
        try {
            return ResponseEntity.ok(studentService.getMyActivities(authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/activities/type/{type}")
    public ResponseEntity<?> getActivitiesByType(@PathVariable String type, Authentication authentication) {
        try {
            return ResponseEntity.ok(studentService.getActivitiesByType(type, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/activities/{id}/register")
    public ResponseEntity<?> registerActivity(@PathVariable Long id, Authentication authentication) {
        try {
            return ResponseEntity.ok(studentService.registerActivity(id, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/activities/{id}/cancel")
    public ResponseEntity<?> cancelActivity(@PathVariable Long id, Authentication authentication) {
        try {
            return ResponseEntity.ok(studentService.cancelActivity(id, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/activities/{id}/complete")
    public ResponseEntity<?> completeActivity(@PathVariable Long id, Authentication authentication) {
        try {
            return ResponseEntity.ok(studentService.completeActivity(id, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(Authentication authentication) {
        try {
            return ResponseEntity.ok(studentService.getStats(authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/learning-paths")
    public ResponseEntity<?> getLearningPaths(Authentication authentication) {
        try {
            return ResponseEntity.ok(studentService.getLearningPaths(authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/activities/{id}")
    public ResponseEntity<?> getActivityDetail(@PathVariable Long id, Authentication authentication) {
        try {
            return ResponseEntity.ok(studentService.getActivityDetail(id, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/activities/{id}/submit")
    public ResponseEntity<?> submitActivity(@PathVariable Long id, Authentication authentication) {
        try {
            return ResponseEntity.ok(studentService.submitActivity(id, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/feedback")
    public ResponseEntity<?> submitFeedback(@RequestBody Map<String, String> feedback, Authentication authentication) {
        try {
            return ResponseEntity.ok(studentService.submitFeedback(feedback, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
} 
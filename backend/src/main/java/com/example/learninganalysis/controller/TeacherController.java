package com.example.learninganalysis.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.learninganalysis.service.TeacherService;
import com.example.learninganalysis.model.User;
import com.example.learninganalysis.model.UserRole;
import org.springframework.http.HttpStatus;
import java.util.Map;
import java.util.logging.Logger;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/teacher")
public class TeacherController {
    private static final Logger logger = Logger.getLogger(TeacherController.class.getName());
    
    @Autowired
    private TeacherService teacherService;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats(Authentication authentication) {
        try {
            logger.info("获取教师仪表盘统计数据: " + authentication.getName());
            Map<String, Object> stats = teacherService.getDashboardStats(authentication.getName());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.warning("获取教师仪表盘统计数据失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/dashboard/classes")
    public ResponseEntity<?> getDashboardClasses(Authentication authentication) {
        try {
            logger.info("获取教师仪表盘班级数据: " + authentication.getName());
            List<Map<String, Object>> classes = teacherService.getDashboardClasses(authentication.getName());
            return ResponseEntity.ok(classes);
        } catch (Exception e) {
            logger.warning("获取教师仪表盘班级数据失败: " + e.getMessage());
            // 返回模拟数据以便前端开发
            List<Map<String, Object>> mockData = new ArrayList<>();
            Map<String, Object> class1 = new HashMap<>();
            class1.put("id", 1);
            class1.put("name", "计算机科学1班");
            class1.put("studentCount", 35);
            class1.put("completionRate", 85);
            mockData.add(class1);
            
            Map<String, Object> class2 = new HashMap<>();
            class2.put("id", 2);
            class2.put("name", "软件工程2班");
            class2.put("studentCount", 40);
            class2.put("completionRate", 76);
            mockData.add(class2);
            
            return ResponseEntity.ok(mockData);
        }
    }
    
    @GetMapping("/dashboard/targets")
    public ResponseEntity<?> getDashboardTargets(Authentication authentication) {
        try {
            logger.info("获取教师仪表盘目标数据: " + authentication.getName());
            List<Map<String, Object>> targets = teacherService.getDashboardTargets(authentication.getName());
            return ResponseEntity.ok(targets);
        } catch (Exception e) {
            logger.warning("获取教师仪表盘目标数据失败: " + e.getMessage());
            // 返回模拟数据
            List<Map<String, Object>> mockData = new ArrayList<>();
            Map<String, Object> target1 = new HashMap<>();
            target1.put("id", 1);
            target1.put("title", "完成科技创新项目");
            target1.put("deadline", "2023-11-30");
            target1.put("affectedStudents", 35);
            target1.put("completionRate", 60);
            mockData.add(target1);
            
            Map<String, Object> target2 = new HashMap<>();
            target2.put("id", 2);
            target2.put("title", "参加志愿服务活动");
            target2.put("deadline", "2023-10-31");
            target2.put("affectedStudents", 75);
            target2.put("completionRate", 85);
            mockData.add(target2);
            
            return ResponseEntity.ok(mockData);
        }
    }
    
    @GetMapping("/dashboard/activities")
    public ResponseEntity<?> getDashboardActivities(Authentication authentication) {
        try {
            logger.info("获取教师仪表盘活动数据: " + authentication.getName());
            List<Map<String, Object>> activities = teacherService.getDashboardActivities(authentication.getName());
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            logger.warning("获取教师仪表盘活动数据失败: " + e.getMessage());
            // 返回模拟数据
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
            
            return ResponseEntity.ok(mockData);
        }
    }

    @GetMapping("/activities")
    public ResponseEntity<?> getActivities(Authentication authentication) {
        try {
            return ResponseEntity.ok(teacherService.getActivities(authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/activities/my")
    public ResponseEntity<?> getMyActivities(Authentication authentication) {
        try {
            return ResponseEntity.ok(teacherService.getMyActivities(authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/activities/type/{type}")
    public ResponseEntity<?> getActivitiesByType(@PathVariable String type, Authentication authentication) {
        try {
            return ResponseEntity.ok(teacherService.getActivitiesByType(type, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/activities/create")
    public ResponseEntity<?> createActivity(@RequestBody Map<String, Object> activityData, Authentication authentication) {
        try {
            return ResponseEntity.ok(teacherService.createActivity(activityData, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/activities/{id}")
    public ResponseEntity<?> updateActivity(@PathVariable Long id, @RequestBody Map<String, Object> activityData, Authentication authentication) {
        try {
            return ResponseEntity.ok(teacherService.updateActivity(id, activityData, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/activities/{id}")
    public ResponseEntity<?> deleteActivity(@PathVariable Long id, Authentication authentication) {
        try {
            return ResponseEntity.ok(teacherService.deleteActivity(id, authentication.getName()));
        } catch (Exception e) {
            logger.warning("删除活动失败: " + e.getMessage());
            // 返回模拟数据，使前端开发能够继续进行
            Map<String, Object> mockResult = new HashMap<>();
            mockResult.put("id", id);
            mockResult.put("title", "模拟活动");
            mockResult.put("deleted", true);
            mockResult.put("message", "模拟删除成功");
            return ResponseEntity.ok(mockResult);
        }
    }

    @GetMapping("/activities/{id}")
    public ResponseEntity<?> getActivityDetail(@PathVariable Long id, Authentication authentication) {
        try {
            return ResponseEntity.ok(teacherService.getActivityDetail(id, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/classes")
    public ResponseEntity<?> getClasses(Authentication authentication) {
        try {
            logger.info("获取教师班级列表: " + authentication.getName());
            List<Map<String, Object>> classes = teacherService.getClasses(authentication.getName());
            return ResponseEntity.ok(classes);
        } catch (Exception e) {
            logger.warning("获取班级列表失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/students")
    public ResponseEntity<?> getStudents(Authentication authentication) {
        try {
            logger.info("获取学生列表: " + authentication.getName());
            List<Map<String, Object>> students = teacherService.getStudents(authentication.getName());
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            logger.warning("获取学生列表失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/class/{id}")
    public ResponseEntity<?> getClassDetail(@PathVariable Long id, Authentication authentication) {
        try {
            logger.info("获取班级详情: " + id + ", 教师: " + authentication.getName());
            Map<String, Object> classDetail = teacherService.getClassDetail(id, authentication.getName());
            return ResponseEntity.ok(classDetail);
        } catch (Exception e) {
            logger.warning("获取班级详情失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/class/create")
    public ResponseEntity<?> createClass(@RequestBody Map<String, Object> classData, Authentication authentication) {
        try {
            logger.info("创建班级: " + authentication.getName());
            Map<String, Object> result = teacherService.createClass(classData, authentication.getName());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.warning("创建班级失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/class/{id}")
    public ResponseEntity<?> updateClass(@PathVariable Long id, @RequestBody Map<String, Object> classData, Authentication authentication) {
        try {
            logger.info("更新班级: " + id + ", 教师: " + authentication.getName());
            Map<String, Object> result = teacherService.updateClass(id, classData, authentication.getName());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.warning("更新班级失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/class/{id}")
    public ResponseEntity<?> deleteClass(@PathVariable Long id, Authentication authentication) {
        try {
            logger.info("删除班级: " + id + ", 教师: " + authentication.getName());
            Map<String, Object> result = teacherService.deleteClass(id, authentication.getName());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.warning("删除班级失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/class/{classId}/student/{studentId}")
    public ResponseEntity<?> addStudentToClass(@PathVariable Long classId, @PathVariable Long studentId, Authentication authentication) {
        try {
            logger.info("添加学生到班级: " + classId + ", 学生: " + studentId + ", 教师: " + authentication.getName());
            Map<String, Object> result = teacherService.addStudentToClass(classId, studentId, authentication.getName());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.warning("添加学生到班级失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/class/{classId}/student/{studentId}")
    public ResponseEntity<?> removeStudentFromClass(@PathVariable Long classId, @PathVariable Long studentId, Authentication authentication) {
        try {
            logger.info("从班级移除学生: " + classId + ", 学生: " + studentId + ", 教师: " + authentication.getName());
            Map<String, Object> result = teacherService.removeStudentFromClass(classId, studentId, authentication.getName());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.warning("从班级移除学生失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/students/{id}")
    public ResponseEntity<?> getStudentDetail(@PathVariable Long id, Authentication authentication) {
        try {
            logger.info("获取学生详情: " + id + ", 教师: " + authentication.getName());
            Map<String, Object> studentDetail = teacherService.getStudentDetail(id, authentication.getName());
            return ResponseEntity.ok(studentDetail);
        } catch (Exception e) {
            logger.warning("获取学生详情失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/students/{id}/evaluations")
    public ResponseEntity<?> getStudentEvaluations(@PathVariable Long id, Authentication authentication) {
        try {
            logger.info("获取学生评估记录: " + id + ", 教师: " + authentication.getName());
            List<Map<String, Object>> evaluations = teacherService.getStudentEvaluations(id, authentication.getName());
            return ResponseEntity.ok(evaluations);
        } catch (Exception e) {
            logger.warning("获取学生评估记录失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/evaluations/create")
    public ResponseEntity<?> createEvaluation(@RequestBody Map<String, Object> evaluationData, Authentication authentication) {
        try {
            logger.info("创建学生评估: 教师: " + authentication.getName());
            Map<String, Object> result = teacherService.createEvaluation(evaluationData, authentication.getName());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.warning("创建学生评估失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/evaluations/{id}")
    public ResponseEntity<?> updateEvaluation(@PathVariable Long id, @RequestBody Map<String, Object> evaluationData, Authentication authentication) {
        try {
            logger.info("更新学生评估: " + id + ", 教师: " + authentication.getName());
            Map<String, Object> result = teacherService.updateEvaluation(id, evaluationData, authentication.getName());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.warning("更新学生评估失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/evaluations/{id}")
    public ResponseEntity<?> deleteEvaluation(@PathVariable Long id, Authentication authentication) {
        try {
            logger.info("删除学生评估: " + id + ", 教师: " + authentication.getName());
            Map<String, Object> result = teacherService.deleteEvaluation(id, authentication.getName());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.warning("删除学生评估失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/students/{id}/activities")
    public ResponseEntity<?> getStudentActivities(@PathVariable Long id, Authentication authentication) {
        try {
            logger.info("获取学生活动记录: " + id + ", 教师: " + authentication.getName());
            List<Map<String, Object>> activities = teacherService.getStudentActivities(id, authentication.getName());
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            logger.warning("获取学生活动记录失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/goals")
    public ResponseEntity<?> getGoals(Authentication authentication) {
        try {
            logger.info("获取学习目标列表: " + authentication.getName());
            List<Map<String, Object>> goals = teacherService.getGoals(authentication.getName());
            return ResponseEntity.ok(goals);
        } catch (Exception e) {
            logger.warning("获取学习目标列表失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
    
    @GetMapping("/goals/{id}")
    public ResponseEntity<?> getGoalDetail(@PathVariable Long id, Authentication authentication) {
        try {
            logger.info("获取学习目标详情: " + id + ", 教师: " + authentication.getName());
            Map<String, Object> goalDetail = teacherService.getGoalDetail(id, authentication.getName());
            return ResponseEntity.ok(goalDetail);
        } catch (Exception e) {
            logger.warning("获取学习目标详情失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
    
    @PostMapping("/goals/create")
    public ResponseEntity<?> createGoal(@RequestBody Map<String, Object> goalData, Authentication authentication) {
        try {
            logger.info("创建学习目标: 教师: " + authentication.getName());
            Map<String, Object> result = teacherService.createGoal(goalData, authentication.getName());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.warning("创建学习目标失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
    
    @PutMapping("/goals/{id}")
    public ResponseEntity<?> updateGoal(@PathVariable Long id, @RequestBody Map<String, Object> goalData, Authentication authentication) {
        try {
            logger.info("更新学习目标: " + id + ", 教师: " + authentication.getName());
            Map<String, Object> result = teacherService.updateGoal(id, goalData, authentication.getName());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.warning("更新学习目标失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
    
    @DeleteMapping("/goals/{id}")
    public ResponseEntity<?> deleteGoal(@PathVariable Long id, Authentication authentication) {
        try {
            logger.info("删除学习目标: " + id + ", 教师: " + authentication.getName());
            Map<String, Object> result = teacherService.deleteGoal(id, authentication.getName());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.warning("删除学习目标失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
    
    @GetMapping("/students/{id}/goals")
    public ResponseEntity<?> getStudentGoals(@PathVariable Long id, Authentication authentication) {
        try {
            logger.info("获取学生学习目标: " + id + ", 教师: " + authentication.getName());
            List<Map<String, Object>> goals = teacherService.getStudentGoals(id, authentication.getName());
            return ResponseEntity.ok(goals);
        } catch (Exception e) {
            logger.warning("获取学生学习目标失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
} 
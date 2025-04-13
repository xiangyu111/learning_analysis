package com.example.learninganalysis.repository;

import com.example.learninganalysis.model.Evaluation;
import com.example.learninganalysis.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    List<Evaluation> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    List<Evaluation> findByTeacherIdOrderByCreatedAtDesc(Long teacherId);
    List<Evaluation> findByStudentAndTeacherOrderByCreatedAtDesc(User student, User teacher);
} 
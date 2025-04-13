package com.example.learninganalysis.repository;

import com.example.learninganalysis.model.ClassEntity;
import com.example.learninganalysis.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClassRepository extends JpaRepository<ClassEntity, Long> {
    List<ClassEntity> findByTeacherId(Long teacherId);
    List<ClassEntity> findByTeacherIdOrderByCreatedAtDesc(Long teacherId);
    List<ClassEntity> findByStudentsContaining(User student);
} 
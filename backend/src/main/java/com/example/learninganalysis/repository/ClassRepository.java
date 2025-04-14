package com.example.learninganalysis.repository;

import com.example.learninganalysis.model.ClassEntity;
import com.example.learninganalysis.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClassRepository extends JpaRepository<ClassEntity, Long> {
    List<ClassEntity> findByTeacherId(Long teacherId);
    List<ClassEntity> findByTeacherIdOrderByCreatedAtDesc(Long teacherId);
    List<ClassEntity> findByStudentsContaining(User student);

    @Query("SELECT c FROM ClassEntity c WHERE c.id NOT IN (SELECT c2.id FROM ClassEntity c2 JOIN c2.students s WHERE s.id = :studentId)")
    List<ClassEntity> findClassesNotJoinedByStudent(Long studentId);

    Optional<ClassEntity> findByNameAndTeacherId(String name, Long teacherId);

    List<ClassEntity> findByNameContaining(String name);
    
    @Query("SELECT DISTINCT c.teacher FROM ClassEntity c")
    List<User> findDistinctTeachers();
    
    @Query("SELECT COUNT(c) FROM ClassEntity c JOIN c.students s WHERE s.id = :studentId")
    long countClassesJoinedByStudent(Long studentId);
}
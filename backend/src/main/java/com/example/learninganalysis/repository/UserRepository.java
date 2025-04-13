package com.example.learninganalysis.repository;

import com.example.learninganalysis.model.User;
import com.example.learninganalysis.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByEmailAndIdNot(String email, Long id);
    List<User> findByRole(UserRole role);
    List<User> findTop10ByRoleOrderByCreatedAtDesc(UserRole role);
    long countByRole(UserRole role);
}
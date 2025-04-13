package com.example.learninganalysis.repository;

import com.example.learninganalysis.model.User;
import com.example.learninganalysis.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    
    long countByRole(UserRole role);
    List<User> findByRole(UserRole role);
} 
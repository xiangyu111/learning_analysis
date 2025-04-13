package com.example.learninganalysis.config;

import com.example.learninganalysis.model.User;
import com.example.learninganalysis.model.UserRole;
import com.example.learninganalysis.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DatabaseInitializer {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    @Profile("dev")
    public CommandLineRunner initDatabase(UserRepository userRepository) {
        return args -> {
            // 检查是否已有管理员
            if (userRepository.count() == 0) {
                System.out.println("初始化数据库...");

                // 创建管理员账号
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setName("管理员");
                admin.setEmail("admin@example.com");
                admin.setRole(UserRole.ADMIN);
                userRepository.save(admin);

                System.out.println("已创建管理员账号: admin/admin123");
            }
        };
    }
} 
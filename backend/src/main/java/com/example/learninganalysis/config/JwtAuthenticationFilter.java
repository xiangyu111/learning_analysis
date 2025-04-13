package com.example.learninganalysis.config;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import java.util.logging.Logger;

public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final Logger logger = Logger.getLogger(JwtAuthenticationFilter.class.getName());

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        try {
            String token = request.getHeader("Authorization");
            
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                logger.info("处理JWT令牌: " + token);
                
                // 解析token
                String[] parts = token.split("\\.");
                if (parts.length >= 2) {
                    String username = parts[0];
                    String role = parts[1];
                    
                    logger.info("从令牌中提取的信息 - 用户名: " + username + ", 角色: " + role);
                    
                    // 这里直接使用角色值，无需添加ROLE_前缀，SecurityConfig中已配置匹配方式
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        username,
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority(role))
                    );
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    logger.info("已设置认证信息到SecurityContext");
                }
            }
        } catch (Exception e) {
            logger.warning("JWT处理异常: " + e.getMessage());
            SecurityContextHolder.clearContext();
        }
        
        filterChain.doFilter(request, response);
    }
} 
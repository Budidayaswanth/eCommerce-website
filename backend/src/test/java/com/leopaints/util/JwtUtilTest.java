package com.leopaints.util;

import com.leopaints.enums.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(
                "leopaints-very-secure-jwt-secret-key-that-is-at-least-256-bits-long",
                900000,
                604800000
        );
    }

    @Test
    void testGenerateAndValidateAccessToken() {
        Long userId = 101L;
        UserRole role = UserRole.ADMIN;

        String token = jwtUtil.generateAccessToken(userId, role);
        assertNotNull(token);
        assertTrue(jwtUtil.validateToken(token));
        assertEquals(userId, jwtUtil.getUserIdFromToken(token));
        assertEquals(role, jwtUtil.getRoleFromToken(token));
        assertFalse(jwtUtil.isTokenExpired(token));
    }

    @Test
    void testGenerateAndValidateRefreshToken() {
        Long userId = 202L;

        String refreshToken = jwtUtil.generateRefreshToken(userId);
        assertNotNull(refreshToken);
        assertTrue(jwtUtil.validateToken(refreshToken));
        assertEquals(userId, jwtUtil.getUserIdFromToken(refreshToken));
    }

    @Test
    void testInvalidToken() {
        assertFalse(jwtUtil.validateToken("invalid.token.here"));
    }
}

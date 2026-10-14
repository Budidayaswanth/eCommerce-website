package com.leopaints.service;

import com.leopaints.dto.request.AdminLoginRequest;
import com.leopaints.dto.request.RegisterRequest;
import com.leopaints.dto.request.VerifyOtpRequest;
import com.leopaints.dto.response.AuthResponse;
import com.leopaints.dto.response.UserResponse;
import com.leopaints.entity.OtpVerification;
import com.leopaints.entity.User;
import com.leopaints.enums.UserRole;
import com.leopaints.exception.BadRequestException;
import com.leopaints.exception.RateLimitException;
import com.leopaints.exception.ResourceNotFoundException;
import com.leopaints.exception.UnauthorizedException;
import com.leopaints.mapper.UserMapper;
import com.leopaints.repository.OtpVerificationRepository;
import com.leopaints.repository.UserRepository;
import com.leopaints.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final OtpVerificationRepository otpVerificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;
    private final RateLimiterService rateLimiterService;

    @Value("${app.otp.expiry-minutes:5}")
    private int otpExpiryMinutes;

    @Value("${app.otp.max-attempts:5}")
    private int maxOtpAttempts;

    @Value("${app.otp.mock-enabled:false}")
    private boolean mockOtpEnabled;

    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public LocalDateTime sendOtp(String phone) {
        // Rate limit check
        if (!rateLimiterService.tryConsumeOtp(phone)) {
            throw new RateLimitException("Too many OTP requests for this phone number. Please try again after an hour.");
        }

        // Generate 6-digit OTP
        int otpCode = 100000 + secureRandom.nextInt(900000);
        String otp = String.valueOf(otpCode);

        // Mask phone for audit safety
        String maskedPhone = phone.length() >= 4 ? "******" + phone.substring(phone.length() - 4) : "******";
        log.info("Generated and dispatched secure OTP for phone {}", maskedPhone);

        String otpHash = passwordEncoder.encode(otp);
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(otpExpiryMinutes);

        OtpVerification otpVerification = OtpVerification.builder()
                .phone(phone)
                .otpHash(otpHash)
                .expiresAt(expiresAt)
                .attemptCount(0)
                .isVerified(false)
                .build();

        otpVerificationRepository.save(otpVerification);
        return expiresAt;
    }

    @Transactional
    public LocalDateTime resendOtp(String phone) {
        // Enforce 30-second cooldown from the most recent OTP request
        otpVerificationRepository.findFirstByPhoneOrderByCreatedAtDesc(phone).ifPresent(lastOtp -> {
            if (lastOtp.getCreatedAt() != null) {
                long secondsSince = java.time.Duration.between(lastOtp.getCreatedAt(), LocalDateTime.now()).getSeconds();
                if (secondsSince < 30) {
                    long remaining = 30 - secondsSince;
                    throw new RateLimitException("Please wait " + remaining + " seconds before requesting a new OTP.");
                }
            }
            // Invalidate the unverified previous OTP so it cannot be reused
            if (!Boolean.TRUE.equals(lastOtp.getIsVerified())) {
                lastOtp.setExpiresAt(LocalDateTime.now().minusSeconds(1));
                otpVerificationRepository.save(lastOtp);
            }
        });

        // Delegate to sendOtp which checks rateLimiterService, generates fresh OTP, and saves
        return sendOtp(phone);
    }

    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        String phone = request.getPhone();
        String submittedOtp = request.getOtp();

        OtpVerification latestOtp = otpVerificationRepository
                .findFirstByPhoneOrderByCreatedAtDesc(phone)
                .orElseThrow(() -> new BadRequestException("No OTP requested for phone: " + phone));

        if (Boolean.TRUE.equals(latestOtp.getIsVerified())) {
            throw new BadRequestException("OTP has already been used");
        }

        if (LocalDateTime.now().isAfter(latestOtp.getExpiresAt())) {
            throw new BadRequestException("OTP has expired. Please request a new one.");
        }

        if (latestOtp.getAttemptCount() >= maxOtpAttempts) {
            throw new BadRequestException("Max OTP verification attempts exceeded. Please request a new OTP.");
        }

        latestOtp.setAttemptCount(latestOtp.getAttemptCount() + 1);

        // Match cryptographic hash, or allow mock 123456 ONLY if explicitly enabled for dev/testing
        boolean isValid = passwordEncoder.matches(submittedOtp, latestOtp.getOtpHash())
                || (mockOtpEnabled && "123456".equals(submittedOtp));
        if (!isValid) {
            otpVerificationRepository.save(latestOtp);
            throw new BadRequestException("Invalid OTP. Remaining attempts: " + (maxOtpAttempts - latestOtp.getAttemptCount()));
        }

        latestOtp.setIsVerified(true);
        otpVerificationRepository.save(latestOtp);

        boolean isNewUser = false;
        User user = userRepository.findByPhone(phone).orElse(null);
        if (user == null) {
            isNewUser = true;
            user = User.builder()
                    .phone(phone)
                    .name("Leo Customer " + phone.substring(phone.length() - 4))
                    .role(UserRole.USER)
                    .isActive(true)
                    .build();
            user = userRepository.save(user);
            log.info("Created new customer user: id={}, phone={}", user.getId(), phone);
        } else if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new UnauthorizedException("Your account has been deactivated. Please contact support.");
        }

        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getRole());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());

        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .user(userMapper.toResponse(user))
                .isNewUser(isNewUser)
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse adminLogin(AdminLoginRequest request) {
        User admin = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (admin.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedException("Access restricted to administrators only");
        }

        if (!Boolean.TRUE.equals(admin.getIsActive())) {
            throw new UnauthorizedException("Administrator account is inactive");
        }

        if (admin.getPasswordHash() == null || !passwordEncoder.matches(request.getPassword(), admin.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String accessToken = jwtUtil.generateAccessToken(admin.getId(), admin.getRole());
        String refreshToken = jwtUtil.generateRefreshToken(admin.getId());

        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .user(userMapper.toResponse(admin))
                .isNewUser(false)
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtUtil.validateToken(refreshToken)) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        String tokenType = jwtUtil.getTokenTypeFromToken(refreshToken);
        if (tokenType != null && !"REFRESH".equals(tokenType)) {
            throw new UnauthorizedException("Invalid token type. Expected REFRESH token.");
        }

        Long userId = jwtUtil.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new UnauthorizedException("User account is inactive");
        }

        String newAccessToken = jwtUtil.generateAccessToken(user.getId(), user.getRole());

        return AuthResponse.builder()
                .token(newAccessToken)
                .refreshToken(refreshToken)
                .user(userMapper.toResponse(user))
                .isNewUser(false)
                .build();
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Phone number is already registered: " + request.getPhone());
        }
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty() && userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use: " + request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .role(UserRole.USER)
                .isActive(true)
                .build();

        user = userRepository.save(user);
        return userMapper.toResponse(user);
    }
}

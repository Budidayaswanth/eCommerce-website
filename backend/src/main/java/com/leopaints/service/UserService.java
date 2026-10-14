package com.leopaints.service;

import com.leopaints.dto.request.AddressRequest;
import com.leopaints.dto.request.UpdateProfileRequest;
import com.leopaints.dto.response.AddressResponse;
import com.leopaints.dto.response.PagedResponse;
import com.leopaints.dto.response.UserResponse;
import com.leopaints.entity.Address;
import com.leopaints.entity.OtpVerification;
import com.leopaints.entity.User;
import com.leopaints.exception.BadRequestException;
import com.leopaints.exception.ResourceNotFoundException;
import com.leopaints.mapper.AddressMapper;
import com.leopaints.mapper.UserMapper;
import com.leopaints.repository.AddressRepository;
import com.leopaints.repository.OtpVerificationRepository;
import com.leopaints.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final OtpVerificationRepository otpVerificationRepository;
    private final UserMapper userMapper;
    private final AddressMapper addressMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Value("${app.otp.mock-enabled:false}")
    private boolean mockOtpEnabled;

    @Transactional(readOnly = true)
    public UserResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return userMapper.toResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            if (!request.getEmail().equalsIgnoreCase(user.getEmail())) {
                if (userRepository.existsByEmail(request.getEmail().trim())) {
                    throw new BadRequestException("Email is already taken by another user");
                }
                user.setEmail(request.getEmail().trim());
            }
        }

        // Changing phone requires OTP verification
        if (request.getPhone() != null && !request.getPhone().equals(user.getPhone())) {
            if (request.getOtp() == null || request.getOtp().trim().isEmpty()) {
                throw new BadRequestException("OTP is required to verify new phone number");
            }
            if (userRepository.existsByPhone(request.getPhone())) {
                throw new BadRequestException("Phone number already registered to another account");
            }

            OtpVerification otpVerification = otpVerificationRepository
                    .findFirstByPhoneOrderByCreatedAtDesc(request.getPhone())
                    .orElseThrow(() -> new BadRequestException("No OTP requested for phone: " + request.getPhone()));

            if (LocalDateTime.now().isAfter(otpVerification.getExpiresAt())) {
                throw new BadRequestException("OTP expired");
            }

            boolean isValid = passwordEncoder.matches(request.getOtp(), otpVerification.getOtpHash())
                    || (mockOtpEnabled && "123456".equals(request.getOtp()));
            if (!isValid) {
                throw new BadRequestException("Invalid OTP for phone change");
            }

            otpVerification.setIsVerified(true);
            otpVerificationRepository.save(otpVerification);
            user.setPhone(request.getPhone());
        }

        User updated = userRepository.save(user);
        auditService.log("USER", userId, "UPDATE_PROFILE", user.getPhone(), null, "Updated profile", null);
        return userMapper.toResponse(updated);
    }

    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> userPage = userRepository.findAll(pageable);
        return PagedResponse.from(userPage.map(userMapper::toResponse));
    }

    @Transactional
    public UserResponse toggleUserStatus(Long userId, String performedBy) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        boolean newStatus = !Boolean.TRUE.equals(user.getIsActive());
        user.setIsActive(newStatus);
        User saved = userRepository.save(user);

        auditService.log("USER", userId, "TOGGLE_STATUS", performedBy, "isActive: " + !newStatus, "isActive: " + newStatus, null);
        return userMapper.toResponse(saved);
    }

    // Address Management
    @Transactional(readOnly = true)
    public List<AddressResponse> getUserAddresses(Long userId) {
        return addressRepository.findByUserId(userId).stream()
                .map(addressMapper::toResponse)
                .toList();
    }

    @Transactional
    public AddressResponse addAddress(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Address address = addressMapper.toEntity(request);
        address.setUser(user);

        // If this is set as default or first address, manage default flag
        List<Address> existing = addressRepository.findByUserId(userId);
        if (existing.isEmpty() || Boolean.TRUE.equals(request.getIsDefault())) {
            existing.forEach(a -> {
                a.setIsDefault(false);
                addressRepository.save(a);
            });
            address.setIsDefault(true);
        }

        Address saved = addressRepository.save(address);
        return addressMapper.toResponse(saved);
    }

    @Transactional
    public AddressResponse updateAddress(Long userId, Long addressId, AddressRequest request) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found or does not belong to you"));

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            List<Address> addresses = addressRepository.findByUserId(userId);
            addresses.forEach(a -> {
                a.setIsDefault(false);
                addressRepository.save(a);
            });
        }

        addressMapper.updateEntityFromRequest(request, address);
        Address updated = addressRepository.save(address);
        return addressMapper.toResponse(updated);
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found or does not belong to you"));

        addressRepository.delete(address);
    }
}

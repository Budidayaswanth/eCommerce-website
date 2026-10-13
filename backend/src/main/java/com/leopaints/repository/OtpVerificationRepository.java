package com.leopaints.repository;

import com.leopaints.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

    List<OtpVerification> findByPhoneOrderByCreatedAtDesc(String phone);

    Optional<OtpVerification> findFirstByPhoneOrderByCreatedAtDesc(String phone);

    long countByPhoneAndCreatedAtAfter(String phone, LocalDateTime after);
}

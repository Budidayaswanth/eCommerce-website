package com.leopaints.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimiterService {

    private final Map<String, Bucket> otpBuckets = new ConcurrentHashMap<>();

    public boolean tryConsumeOtp(String phone) {
        Bucket bucket = otpBuckets.computeIfAbsent(phone, k -> createOtpBucket());
        return bucket.tryConsume(1);
    }

    private Bucket createOtpBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(5)
                .refillIntervally(5, Duration.ofHours(1))
                .build();
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }
}

package com.leopaints.service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Service
public class RateLimiterService {

    // Bounded cache with TTL eviction prevents memory exhaustion under high unique-key volume
    private final Cache<String, Bucket> otpBuckets = Caffeine.newBuilder()
            .maximumSize(50_000)
            .expireAfterAccess(2, TimeUnit.HOURS)
            .build();

    public boolean tryConsumeOtp(String phone) {
        Bucket bucket = otpBuckets.get(phone, k -> createOtpBucket());
        return bucket != null && bucket.tryConsume(1);
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

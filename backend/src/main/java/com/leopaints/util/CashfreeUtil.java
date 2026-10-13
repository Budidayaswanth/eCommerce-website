package com.leopaints.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

@Component
@Slf4j
public class CashfreeUtil {

    private static final String HMAC_SHA256 = "HmacSHA256";

    public String generateSignature(String data, String secretKey) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
            mac.init(secretKeySpec);
            byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hmacBytes);
        } catch (Exception e) {
            log.error("Failed to generate HMAC-SHA256 signature", e);
            throw new RuntimeException("Signature generation failed", e);
        }
    }

    public boolean verifyWebhookSignature(String payload, String signature, String timestamp, String secretKey) {
        if (signature == null || secretKey == null || secretKey.isEmpty()) {
            return false;
        }
        try {
            String dataToSign = (timestamp != null ? timestamp : "") + payload;
            String expectedSignature = generateSignature(dataToSign, secretKey);
            return MessageDigest.isEqual(
                    expectedSignature.getBytes(StandardCharsets.UTF_8),
                    signature.getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            log.error("Failed to verify webhook signature", e);
            return false;
        }
    }
}

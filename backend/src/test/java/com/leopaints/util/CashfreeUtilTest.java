package com.leopaints.util;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CashfreeUtilTest {

    private CashfreeUtil cashfreeUtil;
    private final String secretKey = "test_cashfree_secret_key";

    @BeforeEach
    void setUp() {
        cashfreeUtil = new CashfreeUtil();
    }

    @Test
    void testGenerateAndVerifyWebhookSignature() {
        String timestamp = "1728800000";
        String payload = "{\"data\":{\"order\":{\"order_id\":\"CF_123\"}}}";

        String signature = cashfreeUtil.generateSignature(timestamp + payload, secretKey);
        assertNotNull(signature);

        boolean isValid = cashfreeUtil.verifyWebhookSignature(payload, signature, timestamp, secretKey);
        assertTrue(isValid);
    }

    @Test
    void testTamperedPayloadFailsVerification() {
        String timestamp = "1728800000";
        String payload = "{\"data\":{\"order\":{\"order_id\":\"CF_123\"}}}";
        String tamperedPayload = "{\"data\":{\"order\":{\"order_id\":\"CF_999\"}}}";

        String signature = cashfreeUtil.generateSignature(timestamp + payload, secretKey);

        boolean isValid = cashfreeUtil.verifyWebhookSignature(tamperedPayload, signature, timestamp, secretKey);
        assertFalse(isValid);
    }
}

package com.leopaints.controller;

import com.leopaints.dto.response.ApiResponse;
import com.leopaints.dto.response.ReviewResponse;
import com.leopaints.security.UserPrincipal;
import com.leopaints.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
@Tag(name = "Admin Reviews", description = "Review moderation and approval")
public class AdminReviewController {

    private final ReviewService reviewService;

    @GetMapping("/pending")
    @Operation(summary = "Get all pending reviews for moderation")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getPendingReviews() {
        List<ReviewResponse> response = reviewService.getPendingReviews();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}/approve")
    @Operation(summary = "Approve a customer review")
    public ResponseEntity<ApiResponse<ReviewResponse>> approveReview(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String performedBy = principal != null ? principal.getUsername() : "ADMIN";
        ReviewResponse response = reviewService.approveReview(id, performedBy);
        return ResponseEntity.ok(ApiResponse.success(response, "Review approved"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Reject/delete a review")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String performedBy = principal != null ? principal.getUsername() : "ADMIN";
        reviewService.deleteReview(id, performedBy);
        return ResponseEntity.ok(ApiResponse.success(null, "Review deleted"));
    }
}

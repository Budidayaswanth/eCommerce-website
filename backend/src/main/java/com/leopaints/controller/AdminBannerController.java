package com.leopaints.controller;

import com.leopaints.dto.request.BannerRequest;
import com.leopaints.dto.response.ApiResponse;
import com.leopaints.dto.response.BannerResponse;
import com.leopaints.security.UserPrincipal;
import com.leopaints.service.BannerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/banners")
@RequiredArgsConstructor
@Tag(name = "Admin Banners", description = "Banner management")
public class AdminBannerController {

    private final BannerService bannerService;

    @GetMapping
    @Operation(summary = "Get all banners for admin")
    public ResponseEntity<ApiResponse<List<BannerResponse>>> getAllBanners() {
        List<BannerResponse> response = bannerService.getAllBanners();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get banner by ID")
    public ResponseEntity<ApiResponse<BannerResponse>> getBannerById(@PathVariable Long id) {
        BannerResponse response = bannerService.getBannerById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @Operation(summary = "Create a new banner")
    public ResponseEntity<ApiResponse<BannerResponse>> createBanner(
            @Valid @RequestBody BannerRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String performedBy = principal != null ? principal.getUsername() : "ADMIN";
        BannerResponse response = bannerService.createBanner(request, performedBy);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Banner created successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing banner")
    public ResponseEntity<ApiResponse<BannerResponse>> updateBanner(
            @PathVariable Long id,
            @Valid @RequestBody BannerRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String performedBy = principal != null ? principal.getUsername() : "ADMIN";
        BannerResponse response = bannerService.updateBanner(id, request, performedBy);
        return ResponseEntity.ok(ApiResponse.success(response, "Banner updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a banner")
    public ResponseEntity<ApiResponse<Void>> deleteBanner(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String performedBy = principal != null ? principal.getUsername() : "ADMIN";
        bannerService.deleteBanner(id, performedBy);
        return ResponseEntity.ok(ApiResponse.success(null, "Banner deleted successfully"));
    }
}

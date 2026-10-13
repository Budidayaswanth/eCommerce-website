package com.leopaints.controller;

import com.leopaints.dto.response.ApiResponse;
import com.leopaints.dto.response.BannerResponse;
import com.leopaints.service.BannerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
@Tag(name = "Banners", description = "Public promotional banners")
public class BannerController {

    private final BannerService bannerService;

    @GetMapping
    @Operation(summary = "Get active promotional banners")
    public ResponseEntity<ApiResponse<List<BannerResponse>>> getActiveBanners() {
        List<BannerResponse> response = bannerService.getActiveBanners();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

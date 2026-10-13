package com.leopaints.controller;

import com.leopaints.dto.request.CategoryRequest;
import com.leopaints.dto.response.ApiResponse;
import com.leopaints.dto.response.CategoryResponse;
import com.leopaints.security.UserPrincipal;
import com.leopaints.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
@Tag(name = "Admin Categories", description = "Category management for administrators")
public class AdminCategoryController {

    private final CategoryService categoryService;

    @PostMapping
    @Operation(summary = "Create a new category")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String performedBy = principal != null ? principal.getUsername() : "ADMIN";
        CategoryResponse response = categoryService.createCategory(request, performedBy);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Category created successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing category")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String performedBy = principal != null ? principal.getUsername() : "ADMIN";
        CategoryResponse response = categoryService.updateCategory(id, request, performedBy);
        return ResponseEntity.ok(ApiResponse.success(response, "Category updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a category")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String performedBy = principal != null ? principal.getUsername() : "ADMIN";
        categoryService.deleteCategory(id, performedBy);
        return ResponseEntity.ok(ApiResponse.success(null, "Category deleted successfully"));
    }
}

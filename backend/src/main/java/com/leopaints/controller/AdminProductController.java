package com.leopaints.controller;

import com.leopaints.dto.request.ProductRequest;
import com.leopaints.dto.response.ApiResponse;
import com.leopaints.dto.response.ProductResponse;
import com.leopaints.security.UserPrincipal;
import com.leopaints.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
@Tag(name = "Admin Products", description = "Admin endpoints for catalog and inventory management")
public class AdminProductController {

    private final ProductService productService;

    @PostMapping
    @Operation(summary = "Create a new product")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody ProductRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String performedBy = principal != null ? principal.getUsername() : "ADMIN";
        ProductResponse response = productService.createProduct(request, performedBy);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Product created successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing product")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String performedBy = principal != null ? principal.getUsername() : "ADMIN";
        ProductResponse response = productService.updateProduct(id, request, performedBy);
        return ResponseEntity.ok(ApiResponse.success(response, "Product updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete a product")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String performedBy = principal != null ? principal.getUsername() : "ADMIN";
        productService.deleteProduct(id, performedBy);
        return ResponseEntity.ok(ApiResponse.success(null, "Product deactivated successfully"));
    }

    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload image for products")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(
            @RequestParam("file") MultipartFile file
    ) {
        String imageUrl = productService.uploadProductImage(file);
        return ResponseEntity.ok(ApiResponse.success(Map.of("url", imageUrl), "Image uploaded successfully"));
    }

    @PostMapping(value = "/{id}/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload and attach image to product")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImageForProduct(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "1") int imageIndex,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String imageUrl = productService.uploadProductImage(file);
        ProductResponse product = productService.getProductById(id);
        ProductRequest request = ProductRequest.builder()
                .name(product.getName())
                .description(product.getDescription())
                .listingPrice(product.getListingPrice())
                .sellingPrice(product.getSellingPrice())
                .discountPercent(product.getDiscountPercent())
                .stockQuantity(product.getStockQuantity())
                .imageUrl(imageIndex == 1 ? imageUrl : product.getImageUrl())
                .imageUrl2(imageIndex == 2 ? imageUrl : product.getImageUrl2())
                .imageUrl3(imageIndex == 3 ? imageUrl : product.getImageUrl3())
                .colorHex(product.getColorHex())
                .finish(product.getFinish())
                .paintType(product.getPaintType())
                .coverageSqft(product.getCoverageSqft())
                .sizeLiters(product.getSizeLiters())
                .categoryId(product.getCategoryId())
                .isActive(product.getIsActive())
                .build();

        String performedBy = principal != null ? principal.getUsername() : "ADMIN";
        productService.updateProduct(id, request, performedBy);

        return ResponseEntity.ok(ApiResponse.success(Map.of("url", imageUrl), "Image uploaded and product updated"));
    }
}

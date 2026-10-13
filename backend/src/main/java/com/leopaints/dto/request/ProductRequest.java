package com.leopaints.dto.request;

import com.leopaints.enums.PaintFinish;
import com.leopaints.enums.PaintType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    private String description;

    @NotNull(message = "Listing price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Listing price must be greater than zero")
    private BigDecimal listingPrice;

    @NotNull(message = "Selling price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Selling price must be greater than zero")
    private BigDecimal sellingPrice;

    @Min(value = 0, message = "Discount percent cannot be negative")
    private Integer discountPercent;

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQuantity;

    private String imageUrl;
    private String imageUrl2;
    private String imageUrl3;
    private String colorHex;
    private PaintFinish finish;
    private PaintType paintType;
    private BigDecimal coverageSqft;
    private Double sizeLiters;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @Builder.Default
    private Boolean isActive = true;
}

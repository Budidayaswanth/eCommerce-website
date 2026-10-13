package com.leopaints.dto.response;

import com.leopaints.enums.PaintFinish;
import com.leopaints.enums.PaintType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private BigDecimal listingPrice;
    private BigDecimal sellingPrice;
    private Integer discountPercent;
    private Integer stockQuantity;
    private String imageUrl;
    private String imageUrl2;
    private String imageUrl3;
    private String colorHex;
    private PaintFinish finish;
    private PaintType paintType;
    private BigDecimal coverageSqft;
    private Double sizeLiters;
    private Long categoryId;
    private String categoryName;
    private Boolean isActive;
    private BigDecimal avgRating;
    private Integer reviewCount;
    private Long version;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

package com.leopaints.service;

import com.cloudinary.Cloudinary;
import com.leopaints.dto.response.PagedResponse;
import com.leopaints.dto.response.ProductResponse;
import com.leopaints.entity.Category;
import com.leopaints.entity.Product;
import com.leopaints.enums.PaintFinish;
import com.leopaints.enums.PaintType;
import com.leopaints.mapper.ProductMapper;
import com.leopaints.repository.CategoryRepository;
import com.leopaints.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ProductMapper productMapper;

    @Mock
    private AuditService auditService;

    @Mock
    private Cloudinary cloudinary;

    @InjectMocks
    private ProductService productService;

    private Product sampleProduct;
    private ProductResponse sampleResponse;
    private Category sampleCategory;

    @BeforeEach
    void setUp() {
        sampleCategory = Category.builder()
                .id(1L)
                .name("Interior Paints")
                .slug("interior-paints")
                .build();

        sampleProduct = Product.builder()
                .id(101L)
                .name("Royale Luxury Emulsion")
                .slug("royale-luxury-emulsion")
                .description("Super luxury architectural emulsion with teflon surface protection")
                .category(sampleCategory)
                .paintType(PaintType.EMULSION)
                .finish(PaintFinish.MATTE)
                .listingPrice(BigDecimal.valueOf(1200))
                .sellingPrice(BigDecimal.valueOf(999))
                .stockQuantity(50)
                .isActive(true)
                .build();

        sampleResponse = ProductResponse.builder()
                .id(101L)
                .name("Royale Luxury Emulsion")
                .slug("royale-luxury-emulsion")
                .categoryId(1L)
                .categoryName("Interior Paints")
                .paintType(PaintType.EMULSION)
                .finish(PaintFinish.MATTE)
                .sellingPrice(BigDecimal.valueOf(999))
                .build();
    }

    @Test
    @DisplayName("searchProducts: returns results on strict multi-keyword match")
    void testSearchProductsStrictMatch() {
        Page<Product> pageResult = new PageImpl<>(List.of(sampleProduct));
        when(productRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(pageResult);
        when(productMapper.toResponse(sampleProduct)).thenReturn(sampleResponse);

        PagedResponse<ProductResponse> response = productService.searchProducts("royale matte emulsion", 0, 10);

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        assertEquals("Royale Luxury Emulsion", response.getContent().get(0).getName());
        verify(productRepository, times(1)).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    @DisplayName("searchProducts: falls back to relaxed matching when strict match returns 0 items")
    void testSearchProductsFallbackToRelaxed() {
        Page<Product> emptyPage = new PageImpl<>(List.of());
        Page<Product> relaxedPage = new PageImpl<>(List.of(sampleProduct));

        when(productRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(emptyPage) // First strict match returns empty
                .thenReturn(relaxedPage); // Second relaxed match returns product
        when(productMapper.toResponse(sampleProduct)).thenReturn(sampleResponse);

        PagedResponse<ProductResponse> response = productService.searchProducts("royale exterior nonexisting", 0, 10);

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        assertEquals("Royale Luxury Emulsion", response.getContent().get(0).getName());
        verify(productRepository, times(2)).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    @DisplayName("searchProducts: falls back to popular active products when query has zero matches")
    void testSearchProductsFallbackToPopular() {
        Page<Product> emptyPage = new PageImpl<>(List.of());
        Page<Product> popularPage = new PageImpl<>(List.of(sampleProduct));

        when(productRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(emptyPage);
        when(productRepository.findByIsActiveTrue(any(Pageable.class)))
                .thenReturn(popularPage);
        when(productMapper.toResponse(sampleProduct)).thenReturn(sampleResponse);

        PagedResponse<ProductResponse> response = productService.searchProducts("unknownxyzword123", 0, 10);

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        verify(productRepository).findByIsActiveTrue(any(Pageable.class));
    }

    @Test
    @DisplayName("deleteProduct: sets isActive=false and logs audit record")
    void testSoftDeleteProduct() {
        when(productRepository.findById(101L)).thenReturn(Optional.of(sampleProduct));

        productService.deleteProduct(101L, "admin@leopaints.com");

        assertFalse(sampleProduct.getIsActive());
        verify(productRepository).save(sampleProduct);
        verify(auditService).log(eq("PRODUCT"), eq(101L), eq("SOFT_DELETE"), eq("admin@leopaints.com"), any(), any(), any());
    }
}

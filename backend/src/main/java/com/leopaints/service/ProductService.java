package com.leopaints.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.leopaints.dto.request.ProductRequest;
import com.leopaints.dto.response.PagedResponse;
import com.leopaints.dto.response.ProductResponse;
import com.leopaints.entity.Category;
import com.leopaints.entity.Product;
import com.leopaints.enums.PaintFinish;
import com.leopaints.enums.PaintType;
import com.leopaints.exception.BadRequestException;
import com.leopaints.exception.ResourceNotFoundException;
import com.leopaints.mapper.ProductMapper;
import com.leopaints.repository.CategoryRepository;
import com.leopaints.repository.ProductRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;
    private final AuditService auditService;
    private final Cloudinary cloudinary;

    @Value("${app.cloudinary.cloud-name:}")
    private String cloudinaryCloudName;

    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> getAllProducts(
            int page,
            int size,
            Long categoryId,
            PaintType paintType,
            PaintFinish finish,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String search,
            String sortBy
    ) {
        Sort sort = parseSort(sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isTrue(root.get("isActive")));

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (paintType != null) {
                predicates.add(cb.equal(root.get("paintType"), paintType));
            }
            if (finish != null) {
                predicates.add(cb.equal(root.get("finish"), finish));
            }
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("sellingPrice"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("sellingPrice"), maxPrice));
            }
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Product> productPage = productRepository.findAll(spec, pageable);
        return PagedResponse.from(productPage.map(productMapper::toResponse));
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with slug: " + slug));
        return productMapper.toResponse(product);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return productMapper.toResponse(product);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> searchProducts(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Product> productPage = productRepository.searchByName(query, pageable);
        return PagedResponse.from(productPage.map(productMapper::toResponse));
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request, String performedBy) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Product product = productMapper.toEntity(request);
        product.setCategory(category);
        product.setSlug(generateSlug(request.getName()));

        Product saved = productRepository.save(product);
        auditService.log("PRODUCT", saved.getId(), "CREATE", performedBy, null, saved.getName(), null);
        log.info("Created product: id={}, slug={}", saved.getId(), saved.getSlug());

        return productMapper.toResponse(saved);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request, String performedBy) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        String oldValue = product.getName() + " [Stock: " + product.getStockQuantity() + ", Price: " + product.getSellingPrice() + "]";

        if (!product.getCategory().getId().equals(request.getCategoryId())) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
            product.setCategory(category);
        }

        productMapper.updateEntityFromRequest(request, product);
        Product updated = productRepository.save(product);

        String newValue = updated.getName() + " [Stock: " + updated.getStockQuantity() + ", Price: " + updated.getSellingPrice() + "]";
        auditService.log("PRODUCT", updated.getId(), "UPDATE", performedBy, oldValue, newValue, null);

        return productMapper.toResponse(updated);
    }

    @Transactional
    public void deleteProduct(Long id, String performedBy) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        product.setIsActive(false);
        productRepository.save(product);

        auditService.log("PRODUCT", id, "SOFT_DELETE", performedBy, "isActive: true", "isActive: false", null);
        log.info("Soft-deleted product: id={}", id);
    }

    public String uploadProductImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded image cannot be empty");
        }

        try {
            if (cloudinaryCloudName != null && !cloudinaryCloudName.trim().isEmpty()) {
                @SuppressWarnings("unchecked")
                Map<String, Object> uploadResult = cloudinary.uploader().upload(
                        file.getBytes(),
                        ObjectUtils.asMap("folder", "leo-paints/products")
                );
                return (String) uploadResult.get("secure_url");
            } else {
                // Fallback to local storage for local dev
                String uploadDir = "uploads/products/";
                Path uploadPath = Paths.get(uploadDir);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
                Path filePath = uploadPath.resolve(filename);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                return "/uploads/products/" + filename;
            }
        } catch (IOException e) {
            log.error("Failed to upload product image", e);
            throw new BadRequestException("Failed to upload image: " + e.getMessage());
        }
    }

    private String generateSlug(String name) {
        String baseSlug = name.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
        String slug = baseSlug;
        int count = 1;
        while (productRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + count++;
        }
        return slug;
    }

    private Sort parseSort(String sortBy) {
        if (sortBy == null) {
            return Sort.by("id").descending();
        }
        return switch (sortBy.toLowerCase()) {
            case "price_asc" -> Sort.by("sellingPrice").ascending();
            case "price_desc" -> Sort.by("sellingPrice").descending();
            case "name_asc" -> Sort.by("name").ascending();
            case "name_desc" -> Sort.by("name").descending();
            case "rating" -> Sort.by("avgRating").descending();
            case "newest" -> Sort.by("createdAt").descending();
            default -> Sort.by("id").descending();
        };
    }
}

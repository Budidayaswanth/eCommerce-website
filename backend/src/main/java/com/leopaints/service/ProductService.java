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
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
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
            String category,
            String paintType,
            String finish,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            BigDecimal minRating,
            Boolean inStockOnly,
            String search,
            String sortBy
    ) {
        Sort sort = parseSort(sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        List<PaintType> parsedPaintTypes = parsePaintTypes(paintType);
        List<PaintFinish> parsedFinishes = parsePaintFinishes(finish);
        List<String> searchTokens = extractTokens(search);

        Specification<Product> spec = createFilterSpecification(
                categoryId, category, parsedPaintTypes, parsedFinishes,
                minPrice, maxPrice, minRating, inStockOnly, searchTokens, false
        );

        Page<Product> productPage = productRepository.findAll(spec, pageable);

        // Relative fallback: If search was provided with multiple words and returned 0 products on page 0,
        // relax search tokens (ANY token match) while maintaining the other user filters
        if (productPage.isEmpty() && page == 0 && searchTokens.size() > 1) {
            Specification<Product> relaxedSpec = createFilterSpecification(
                    categoryId, category, parsedPaintTypes, parsedFinishes,
                    minPrice, maxPrice, minRating, inStockOnly, searchTokens, true
            );
            Page<Product> relaxedPage = productRepository.findAll(relaxedSpec, pageable);
            if (!relaxedPage.isEmpty()) {
                productPage = relaxedPage;
            }
        }

        return PagedResponse.from(productPage.map(productMapper::toResponse));
    }

    private Specification<Product> createFilterSpecification(
            Long categoryId,
            String category,
            List<PaintType> parsedPaintTypes,
            List<PaintFinish> parsedFinishes,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            BigDecimal minRating,
            Boolean inStockOnly,
            List<String> searchTokens,
            boolean relaxedSearch
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isTrue(root.get("isActive")));

            Join<Product, Category> categoryJoin = null;

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            } else if (category != null && !category.trim().isEmpty() && !"all".equalsIgnoreCase(category.trim())) {
                String cleanCat = category.trim().toLowerCase();
                if (cleanCat.matches("\\d+")) {
                    predicates.add(cb.equal(root.get("category").get("id"), Long.parseLong(cleanCat)));
                } else {
                    categoryJoin = getOrCreateCategoryJoin(root);
                    String pattern = "%" + cleanCat.replace("-", "%") + "%";
                    predicates.add(cb.or(
                            cb.like(cb.lower(categoryJoin.get("slug")), pattern),
                            cb.like(cb.lower(categoryJoin.get("name")), pattern)
                    ));
                }
            }

            if (!parsedPaintTypes.isEmpty()) {
                predicates.add(root.get("paintType").in(parsedPaintTypes));
            }
            if (!parsedFinishes.isEmpty()) {
                predicates.add(root.get("finish").in(parsedFinishes));
            }
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("sellingPrice"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("sellingPrice"), maxPrice));
            }
            if (minRating != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("avgRating"), minRating));
            }
            if (Boolean.TRUE.equals(inStockOnly)) {
                predicates.add(cb.greaterThan(root.get("stockQuantity"), 0));
            }

            if (!searchTokens.isEmpty()) {
                if (categoryJoin == null) {
                    categoryJoin = getOrCreateCategoryJoin(root);
                }
                List<Predicate> tokenPredicates = new ArrayList<>();
                for (String token : searchTokens) {
                    tokenPredicates.add(buildTokenPredicate(root, categoryJoin, cb, token));
                }

                if (relaxedSearch) {
                    predicates.add(cb.or(tokenPredicates.toArray(new Predicate[0])));
                } else {
                    predicates.add(cb.and(tokenPredicates.toArray(new Predicate[0])));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private List<String> extractTokens(String query) {
        if (query == null || query.trim().isEmpty()) {
            return java.util.Collections.emptyList();
        }
        String clean = query.trim().toLowerCase();
        String[] parts = clean.split("[\\s,;+&|/\\-]+");
        List<String> tokens = new ArrayList<>();
        for (String part : parts) {
            String p = part.trim();
            if (!p.isEmpty()) {
                tokens.add(p);
            }
        }
        return tokens;
    }

    private Join<Product, Category> getOrCreateCategoryJoin(Root<Product> root) {
        for (Join<Product, ?> join : root.getJoins()) {
            if ("category".equals(join.getAttribute().getName())) {
                @SuppressWarnings("unchecked")
                Join<Product, Category> categoryJoin = (Join<Product, Category>) join;
                return categoryJoin;
            }
        }
        return root.join("category", JoinType.LEFT);
    }

    private Predicate buildTokenPredicate(
            Root<Product> root,
            Join<Product, Category> categoryJoin,
            CriteriaBuilder cb,
            String token
    ) {
        String pattern = "%" + token + "%";
        List<Predicate> tokenMatches = new ArrayList<>();
        tokenMatches.add(cb.like(cb.lower(root.get("name")), pattern));
        tokenMatches.add(cb.like(cb.lower(root.get("description")), pattern));
        if (categoryJoin != null) {
            tokenMatches.add(cb.like(cb.lower(categoryJoin.get("name")), pattern));
            tokenMatches.add(cb.like(cb.lower(categoryJoin.get("slug")), pattern));
        }

        // Match PaintType enum
        for (PaintType pt : PaintType.values()) {
            String ptName = pt.name().toLowerCase();
            String ptClean = ptName.replace("_", "");
            if (ptName.contains(token) || token.contains(ptClean)) {
                tokenMatches.add(cb.equal(root.get("paintType"), pt));
                break;
            }
        }

        // Match PaintFinish enum
        for (PaintFinish pf : PaintFinish.values()) {
            String pfName = pf.name().toLowerCase();
            String pfClean = pfName.replace("_", "");
            if (pfName.contains(token) || token.contains(pfClean)) {
                tokenMatches.add(cb.equal(root.get("finish"), pf));
                break;
            }
        }

        return cb.or(tokenMatches.toArray(new Predicate[0]));
    }

    private List<PaintType> parsePaintTypes(String types) {
        if (types == null || types.trim().isEmpty()) return java.util.Collections.emptyList();
        List<PaintType> result = new ArrayList<>();
        String[] parts = types.split(",");
        for (String part : parts) {
            String clean = part.trim().toUpperCase().replace(" ", "_").replace("-", "_");
            for (PaintType pt : PaintType.values()) {
                if (pt.name().equalsIgnoreCase(clean) || clean.contains(pt.name())) {
                    if (!result.contains(pt)) result.add(pt);
                    break;
                }
            }
        }
        return result;
    }

    private List<PaintFinish> parsePaintFinishes(String finishes) {
        if (finishes == null || finishes.trim().isEmpty()) return java.util.Collections.emptyList();
        List<PaintFinish> result = new ArrayList<>();
        String[] parts = finishes.split(",");
        for (String part : parts) {
            String clean = part.trim().toUpperCase().replace(" ", "_").replace("-", "_");
            for (PaintFinish pf : PaintFinish.values()) {
                if (pf.name().equalsIgnoreCase(clean) || clean.contains(pf.name())) {
                    if (!result.contains(pf)) result.add(pf);
                    break;
                }
            }
        }
        return result;
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
        Pageable pageable = PageRequest.of(page, size, Sort.by("avgRating").descending().and(Sort.by("id").descending()));
        List<String> tokens = extractTokens(query);

        if (tokens.isEmpty()) {
            Page<Product> fallback = productRepository.findByIsActiveTrue(pageable);
            return PagedResponse.from(fallback.map(productMapper::toResponse));
        }

        // Phase 1: Strict Multi-token Match (ALL tokens must match across product name, description, category, paintType, finish)
        Specification<Product> strictSpec = (root, q, cb) -> {
            Join<Product, Category> categoryJoin = getOrCreateCategoryJoin(root);
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isTrue(root.get("isActive")));

            for (String token : tokens) {
                predicates.add(buildTokenPredicate(root, categoryJoin, cb, token));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Product> productPage = productRepository.findAll(strictSpec, pageable);

        // Phase 2: Relative Matching Fallback (if strict match has 0 results, match ANY token)
        if (productPage.isEmpty() && tokens.size() > 1) {
            Specification<Product> relaxedSpec = (root, q, cb) -> {
                Join<Product, Category> categoryJoin = getOrCreateCategoryJoin(root);
                List<Predicate> orPredicates = new ArrayList<>();
                for (String token : tokens) {
                    orPredicates.add(buildTokenPredicate(root, categoryJoin, cb, token));
                }

                return cb.and(
                        cb.isTrue(root.get("isActive")),
                        cb.or(orPredicates.toArray(new Predicate[0]))
                );
            };

            productPage = productRepository.findAll(relaxedSpec, pageable);
        }

        // Phase 3: Relative Popular Fallback (if still empty, e.g. unknown search term, return top active paints)
        if (productPage.isEmpty()) {
            productPage = productRepository.findByIsActiveTrue(pageable);
        }

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

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
        }

        if (!List.of(".jpg", ".jpeg", ".png", ".webp", ".avif").contains(extension)) {
            throw new BadRequestException("Invalid image format. Allowed formats: JPG, PNG, WEBP, AVIF");
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
                String filename = UUID.randomUUID() + extension;
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

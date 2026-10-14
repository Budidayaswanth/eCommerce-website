package com.leopaints.service;

import com.leopaints.dto.request.ReviewRequest;
import com.leopaints.dto.response.PagedResponse;
import com.leopaints.dto.response.ReviewResponse;
import com.leopaints.entity.Product;
import com.leopaints.entity.Review;
import com.leopaints.entity.User;
import com.leopaints.exception.BadRequestException;
import com.leopaints.exception.ResourceNotFoundException;
import com.leopaints.mapper.ReviewMapper;
import com.leopaints.repository.ProductRepository;
import com.leopaints.repository.ReviewRepository;
import com.leopaints.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ReviewMapper reviewMapper;
    private final AuditService auditService;

    @Transactional
    public ReviewResponse addReview(Long userId, Long productId, ReviewRequest request) {
        if (reviewRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new BadRequestException("You have already reviewed this product");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(request.getRating())
                .comment(request.getComment())
                .isApproved(false) // Needs admin moderation
                .build();

        Review saved = reviewRepository.save(review);
        log.info("Review submitted for product id={}, waiting for approval", productId);
        return reviewMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ReviewResponse> getProductReviews(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Review> reviewPage = reviewRepository.findByProductIdAndIsApprovedTrue(productId, pageable);
        return PagedResponse.from(reviewPage.map(reviewMapper::toResponse));
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getPendingReviews() {
        return reviewRepository.findByIsApprovedFalse().stream()
                .map(reviewMapper::toResponse)
                .toList();
    }

    @Transactional
    public ReviewResponse approveReview(Long reviewId, String performedBy) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));

        review.setIsApproved(true);
        reviewRepository.save(review);

        // Update product average rating & count
        Product product = review.getProduct();
        Double avgRating = reviewRepository.calculateAverageRating(product.getId());
        long approvedCount = reviewRepository.countApprovedReviewsByProductId(product.getId());

        product.setAvgRating(avgRating != null ? BigDecimal.valueOf(avgRating).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO);
        product.setReviewCount((int) approvedCount);
        productRepository.save(product);

        auditService.log("REVIEW", reviewId, "APPROVE", performedBy, "isApproved: false", "isApproved: true", null);
        return reviewMapper.toResponse(review);
    }

    @Transactional
    public void deleteReview(Long reviewId, String performedBy) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));

        Product product = review.getProduct();
        reviewRepository.delete(review);

        // Recalculate average rating & count
        Double avgRating = reviewRepository.calculateAverageRating(product.getId());
        long approvedCount = reviewRepository.countApprovedReviewsByProductId(product.getId());

        product.setAvgRating(avgRating != null ? BigDecimal.valueOf(avgRating).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO);
        product.setReviewCount((int) approvedCount);
        productRepository.save(product);

        auditService.log("REVIEW", reviewId, "DELETE", performedBy, "rating: " + review.getRating(), null, null);
    }
}

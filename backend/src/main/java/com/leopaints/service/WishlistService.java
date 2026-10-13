package com.leopaints.service;

import com.leopaints.dto.response.WishlistResponse;
import com.leopaints.entity.Product;
import com.leopaints.entity.User;
import com.leopaints.entity.Wishlist;
import com.leopaints.exception.BadRequestException;
import com.leopaints.exception.ResourceNotFoundException;
import com.leopaints.mapper.ProductMapper;
import com.leopaints.repository.ProductRepository;
import com.leopaints.repository.UserRepository;
import com.leopaints.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductMapper productMapper;

    @Transactional(readOnly = true)
    public List<WishlistResponse> getUserWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId).stream()
                .map(item -> WishlistResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .product(productMapper.toResponse(item.getProduct()))
                        .addedAt(item.getAddedAt())
                        .build())
                .toList();
    }

    @Transactional
    public WishlistResponse addToWishlist(Long userId, Long productId) {
        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new BadRequestException("Product is already in your wishlist");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .product(product)
                .build();

        Wishlist saved = wishlistRepository.save(wishlist);
        return WishlistResponse.builder()
                .id(saved.getId())
                .productId(product.getId())
                .product(productMapper.toResponse(product))
                .addedAt(saved.getAddedAt())
                .build();
    }

    @Transactional
    public void removeFromWishlist(Long userId, Long productId) {
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }
}

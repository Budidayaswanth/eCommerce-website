package com.leopaints.service;

import com.leopaints.dto.response.CartResponse;
import com.leopaints.entity.Cart;
import com.leopaints.entity.CartItem;
import com.leopaints.entity.Product;
import com.leopaints.entity.User;
import com.leopaints.exception.BadRequestException;
import com.leopaints.exception.ResourceNotFoundException;
import com.leopaints.mapper.CartMapper;
import com.leopaints.repository.CartItemRepository;
import com.leopaints.repository.CartRepository;
import com.leopaints.repository.ProductRepository;
import com.leopaints.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartMapper cartMapper;

    @Transactional
    public Cart getOrCreateCartEntity(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
            Cart newCart = Cart.builder().user(user).build();
            return cartRepository.save(newCart);
        });
    }

    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId).orElse(null);
        return cartMapper.toResponse(cart);
    }

    @Transactional
    public CartResponse addItem(Long userId, Long productId, int quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than zero");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (!Boolean.TRUE.equals(product.getIsActive())) {
            throw new BadRequestException("Product is currently unavailable");
        }

        Cart cart = getOrCreateCartEntity(userId);

        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId);

        int newTotalQuantity = quantity;
        CartItem cartItem;

        if (existingItemOpt.isPresent()) {
            cartItem = existingItemOpt.get();
            newTotalQuantity = cartItem.getQuantity() + quantity;
            if (newTotalQuantity > product.getStockQuantity()) {
                throw new BadRequestException("Cannot add " + quantity + " more. Only " + product.getStockQuantity() + " available in stock.");
            }
            cartItem.setQuantity(newTotalQuantity);
        } else {
            if (quantity > product.getStockQuantity()) {
                throw new BadRequestException("Insufficient stock. Only " + product.getStockQuantity() + " available.");
            }
            cartItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(quantity)
                    .build();
            cart.getItems().add(cartItem);
        }

        cartItemRepository.save(cartItem);
        Cart updatedCart = cartRepository.save(cart);
        return cartMapper.toResponse(updatedCart);
    }

    @Transactional
    public CartResponse updateItemQuantity(Long userId, Long itemId, int quantity) {
        if (quantity <= 0) {
            return removeItem(userId, itemId);
        }

        Cart cart = getOrCreateCartEntity(userId);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to your cart");
        }

        Product product = item.getProduct();
        if (quantity > product.getStockQuantity()) {
            throw new BadRequestException("Insufficient stock. Only " + product.getStockQuantity() + " available.");
        }

        item.setQuantity(quantity);
        cartItemRepository.save(item);

        Cart updatedCart = cartRepository.findById(cart.getId()).orElse(cart);
        return cartMapper.toResponse(updatedCart);
    }

    @Transactional
    public CartResponse removeItem(Long userId, Long itemId) {
        Cart cart = getOrCreateCartEntity(userId);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to your cart");
        }

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        Cart updatedCart = cartRepository.findById(cart.getId()).orElse(cart);
        return cartMapper.toResponse(updatedCart);
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId).orElse(null);
        if (cart != null) {
            cart.getItems().clear();
            cartItemRepository.deleteByCartId(cart.getId());
            cartRepository.save(cart);
        }
    }
}

package com.leopaints.service;

import com.leopaints.dto.request.BannerRequest;
import com.leopaints.dto.response.BannerResponse;
import com.leopaints.entity.Banner;
import com.leopaints.exception.ResourceNotFoundException;
import com.leopaints.mapper.BannerMapper;
import com.leopaints.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BannerService {

    private final BannerRepository bannerRepository;
    private final BannerMapper bannerMapper;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<BannerResponse> getActiveBanners() {
        return bannerRepository.findByIsActiveTrueOrderByDisplayOrderAsc().stream()
                .map(bannerMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BannerResponse> getAllBanners() {
        return bannerRepository.findAllByOrderByDisplayOrderAsc().stream()
                .map(bannerMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BannerResponse getBannerById(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner not found with id: " + id));
        return bannerMapper.toResponse(banner);
    }

    @Transactional
    public BannerResponse createBanner(BannerRequest request, String performedBy) {
        Banner banner = bannerMapper.toEntity(request);
        Banner saved = bannerRepository.save(banner);
        auditService.log("BANNER", saved.getId(), "CREATE", performedBy, null, saved.getTitle(), null);
        return bannerMapper.toResponse(saved);
    }

    @Transactional
    public BannerResponse updateBanner(Long id, BannerRequest request, String performedBy) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner not found with id: " + id));

        bannerMapper.updateEntityFromRequest(request, banner);
        Banner updated = bannerRepository.save(banner);
        auditService.log("BANNER", updated.getId(), "UPDATE", performedBy, null, updated.getTitle(), null);
        return bannerMapper.toResponse(updated);
    }

    @Transactional
    public void deleteBanner(Long id, String performedBy) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner not found with id: " + id));

        bannerRepository.delete(banner);
        auditService.log("BANNER", id, "DELETE", performedBy, banner.getTitle(), null, null);
    }
}

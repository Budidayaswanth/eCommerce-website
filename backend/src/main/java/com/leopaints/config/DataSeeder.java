package com.leopaints.config;

import com.leopaints.entity.*;
import com.leopaints.enums.*;
import com.leopaints.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final BannerRepository bannerRepository;
    private final CouponRepository couponRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking if database seeding is required...");

        seedAdminUser();
        Map<String, Category> categories = seedCategories();
        seedProducts(categories);
        seedBanners();
        seedCoupons();

        log.info("Database seeding check completed successfully!");
    }

    private void seedAdminUser() {
        if (!userRepository.existsByEmail("admin@leopaints.com")) {
            User admin = User.builder()
                    .name("Leo Paints Admin")
                    .email("admin@leopaints.com")
                    .phone("9876543210")
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .role(UserRole.ADMIN)
                    .isActive(true)
                    .build();
            userRepository.save(admin);
            log.info("Seeded Admin user: admin@leopaints.com");
        }
    }

    private Map<String, Category> seedCategories() {
        Map<String, Category> categoryMap = new HashMap<>();

        String[][] categoriesData = {
                {"Interior Paints", "interior-paints", "Premium washable and luxury emulsion paints for stunning indoor living spaces", "https://images.unsplash.com/photo-1589939705384-5185137a7f0f"},
                {"Exterior Paints", "exterior-paints", "Weatherproof, anti-algal exterior wall coats with long-lasting UV protection", "https://images.unsplash.com/photo-1513694203232-719a280e022f"},
                {"Primers", "primers", "High-adhesion sealing primers for drywall, masonry, wood, and metal surfaces", "https://images.unsplash.com/photo-1562259949-e8e7689d7828"},
                {"Enamels", "enamels", "Gloss and satin high-durability synthetic enamels for doors, grills, and trims", "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119"},
                {"Emulsions", "emulsions", "Smooth matte and silk finish water-based emulsions for high-traffic rooms", "https://images.unsplash.com/photo-1541701494587-cb58502866ab"},
                {"Waterproofing", "waterproofing", "Heavy-duty elastomeric waterproofing solutions for terraces, roofs, and basements", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c"},
                {"Wood Finishes", "wood-finishes", "Clear coats, stains, and polyurethane varnishes that highlight natural timber grain", "https://images.unsplash.com/photo-1538688525198-9b88f6f53126"},
                {"Textures", "textures", "Artisan designer textured finishes creating bespoke accent and feature walls", "https://images.unsplash.com/photo-1507652313519-d4e9174996dd"}
        };

        for (String[] cat : categoriesData) {
            String name = cat[0];
            String slug = cat[1];
            String desc = cat[2];
            String img = cat[3];

            Category category = categoryRepository.findBySlug(slug).orElseGet(() -> {
                Category newCat = Category.builder()
                        .name(name)
                        .slug(slug)
                        .description(desc)
                        .imageUrl(img)
                        .build();
                return categoryRepository.save(newCat);
            });
            categoryMap.put(slug, category);
        }

        log.info("Seeded 8 paint categories");
        return categoryMap;
    }

    private void seedProducts(Map<String, Category> categories) {
        if (productRepository.count() >= 25) {
            return;
        }

        List<Product> products = new ArrayList<>();

        // 1 - 4: Interior
        Category interior = categories.get("interior-paints");
        products.add(Product.builder()
                .name("Royale Luxury Silk Emulsion")
                .slug("royale-luxury-silk-emulsion")
                .description("Ultra-smooth Teflon surface protected luxury interior paint with Teflon surface protector and stain resistance.")
                .listingPrice(new BigDecimal("1850.00"))
                .sellingPrice(new BigDecimal("1450.00"))
                .discountPercent(21)
                .stockQuantity(120)
                .imageUrl("https://images.unsplash.com/photo-1562259949-e8e7689d7828")
                .colorHex("#FFFDD0")
                .finish(PaintFinish.SATIN)
                .paintType(PaintType.INTERIOR)
                .coverageSqft(new BigDecimal("320.00"))
                .sizeLiters(4.0)
                .category(interior)
                .avgRating(new BigDecimal("4.80"))
                .reviewCount(42)
                .isActive(true)
                .build());

        products.add(Product.builder()
                .name("Royale Aspira Ultra Clean")
                .slug("royale-aspira-ultra-clean")
                .description("The pinnacle of indoor paints with crack-bridging ability and highest washability performance.")
                .listingPrice(new BigDecimal("3200.00"))
                .sellingPrice(new BigDecimal("2650.00"))
                .discountPercent(17)
                .stockQuantity(65)
                .imageUrl("https://images.unsplash.com/photo-1589939705384-5185137a7f0f")
                .colorHex("#FDF5E6")
                .finish(PaintFinish.MATTE)
                .paintType(PaintType.INTERIOR)
                .coverageSqft(new BigDecimal("350.00"))
                .sizeLiters(4.0)
                .category(interior)
                .avgRating(new BigDecimal("4.90"))
                .reviewCount(28)
                .isActive(true)
                .build());

        products.add(Product.builder()
                .name("Tractor Emulsion Shyne")
                .slug("tractor-emulsion-shyne")
                .description("Affordable plastic paint delivering radiant eggshell sheen and 1.5x coverage compared to ordinary distempers.")
                .listingPrice(new BigDecimal("750.00"))
                .sellingPrice(new BigDecimal("590.00"))
                .discountPercent(21)
                .stockQuantity(200)
                .imageUrl("https://images.unsplash.com/photo-1541701494587-cb58502866ab")
                .colorHex("#FAF0E6")
                .finish(PaintFinish.EGGSHELL)
                .paintType(PaintType.INTERIOR)
                .coverageSqft(new BigDecimal("260.00"))
                .sizeLiters(4.0)
                .category(interior)
                .avgRating(new BigDecimal("4.40"))
                .reviewCount(35)
                .isActive(true)
                .build());

        products.add(Product.builder()
                .name("Tractor Uno Acrylic Distemper")
                .slug("tractor-uno-acrylic-distemper")
                .description("Smooth water-based acrylic distemper offering budget-friendly wall decoration for rental properties.")
                .listingPrice(new BigDecimal("350.00"))
                .sellingPrice(new BigDecimal("280.00"))
                .discountPercent(20)
                .stockQuantity(150)
                .imageUrl("https://images.unsplash.com/photo-1579783900882-c0d3dad7b119")
                .colorHex("#FFF8DC")
                .finish(PaintFinish.MATTE)
                .paintType(PaintType.DISTEMPER)
                .coverageSqft(new BigDecimal("200.00"))
                .sizeLiters(5.0)
                .category(interior)
                .avgRating(new BigDecimal("4.10"))
                .reviewCount(19)
                .isActive(true)
                .build());

        // 5 - 8: Exterior
        Category exterior = categories.get("exterior-paints");
        products.add(Product.builder()
                .name("Apex Ultima Weatherproof Exterior Emulsion")
                .slug("apex-ultima-weatherproof-exterior-emulsion")
                .description("Advanced high-performance exterior wall coating formulated with dirt pickup resistance and silicon additives.")
                .listingPrice(new BigDecimal("3500.00"))
                .sellingPrice(new BigDecimal("2800.00"))
                .discountPercent(20)
                .stockQuantity(85)
                .imageUrl("https://images.unsplash.com/photo-1513694203232-719a280e022f")
                .colorHex("#F0E68C")
                .finish(PaintFinish.SEMI_GLOSS)
                .paintType(PaintType.EXTERIOR)
                .coverageSqft(new BigDecimal("300.00"))
                .sizeLiters(4.0)
                .category(exterior)
                .avgRating(new BigDecimal("4.75"))
                .reviewCount(52)
                .isActive(true)
                .build());

        products.add(Product.builder()
                .name("Apex Weather Shield Exterior")
                .slug("apex-weather-shield-exterior")
                .description("Water-repellent anti-fungal exterior paint designed to safeguard buildings against harsh tropical monsoon downpours.")
                .listingPrice(new BigDecimal("2750.00"))
                .sellingPrice(new BigDecimal("2250.00"))
                .discountPercent(18)
                .stockQuantity(90)
                .imageUrl("https://images.unsplash.com/photo-1513694203232-719a280e022f")
                .colorHex("#B0C4DE")
                .finish(PaintFinish.SEMI_GLOSS)
                .paintType(PaintType.EXTERIOR)
                .coverageSqft(new BigDecimal("280.00"))
                .sizeLiters(4.0)
                .category(exterior)
                .avgRating(new BigDecimal("4.60"))
                .reviewCount(31)
                .isActive(true)
                .build());

        products.add(Product.builder()
                .name("Apex Floor Guard Tile & Patio Coat")
                .slug("apex-floor-guard-tile-patio-coat")
                .description("Cross-linking polyurethane floor coating engineered for driveways, terraces, walkways, and concrete porch tiles.")
                .listingPrice(new BigDecimal("2400.00"))
                .sellingPrice(new BigDecimal("1950.00"))
                .discountPercent(18)
                .stockQuantity(40)
                .imageUrl("https://images.unsplash.com/photo-1600585154340-be6161a56a0c")
                .colorHex("#808080")
                .finish(PaintFinish.SATIN)
                .paintType(PaintType.EXTERIOR)
                .coverageSqft(new BigDecimal("220.00"))
                .sizeLiters(4.0)
                .category(exterior)
                .avgRating(new BigDecimal("4.50"))
                .reviewCount(14)
                .isActive(true)
                .build());

        // 8 - 11: Primers
        Category primers = categories.get("primers");
        products.add(Product.builder()
                .name("TruCare Acrylic Wall Primer")
                .slug("trucare-acrylic-wall-primer")
                .description("Fast drying water-thinnable exterior & interior primer providing excellent adhesion and uniform porosity reduction.")
                .listingPrice(new BigDecimal("520.00"))
                .sellingPrice(new BigDecimal("420.00"))
                .discountPercent(19)
                .stockQuantity(160)
                .imageUrl("https://images.unsplash.com/photo-1562259949-e8e7689d7828")
                .colorHex("#F5F5DC")
                .finish(PaintFinish.MATTE)
                .paintType(PaintType.PRIMER)
                .coverageSqft(new BigDecimal("240.00"))
                .sizeLiters(4.0)
                .category(primers)
                .avgRating(new BigDecimal("4.65"))
                .reviewCount(38)
                .isActive(true)
                .build());

        products.add(Product.builder()
                .name("Exterior Weather Shield Primer")
                .slug("exterior-weather-shield-primer")
                .description("Heavy duty alkali-resistant exterior masonry primer sealing micro-pores and preventing efflorescence chalking.")
                .listingPrice(new BigDecimal("720.00"))
                .sellingPrice(new BigDecimal("580.00"))
                .discountPercent(19)
                .stockQuantity(110)
                .imageUrl("https://images.unsplash.com/photo-1562259949-e8e7689d7828")
                .colorHex("#FFFFFF")
                .finish(PaintFinish.MATTE)
                .paintType(PaintType.PRIMER)
                .coverageSqft(new BigDecimal("260.00"))
                .sizeLiters(4.0)
                .category(primers)
                .avgRating(new BigDecimal("4.70"))
                .reviewCount(22)
                .isActive(true)
                .build());

        products.add(Product.builder()
                .name("TruCare Undercoat Oil Primer")
                .slug("trucare-undercoat-oil-primer")
                .description("Solvent thinnable wood & metal primer delivering rich film build and rust inhibition for iron fixtures.")
                .listingPrice(new BigDecimal("600.00"))
                .sellingPrice(new BigDecimal("490.00"))
                .discountPercent(18)
                .stockQuantity(80)
                .imageUrl("https://images.unsplash.com/photo-1562259949-e8e7689d7828")
                .colorHex("#F5F5F5")
                .finish(PaintFinish.MATTE)
                .paintType(PaintType.PRIMER)
                .coverageSqft(new BigDecimal("180.00"))
                .sizeLiters(1.0)
                .category(primers)
                .avgRating(new BigDecimal("4.35"))
                .reviewCount(17)
                .isActive(true)
                .build());

        products.add(Product.builder()
                .name("Premium Epoxy Floor Primer")
                .slug("premium-epoxy-floor-primer")
                .description("Two-pack polyamide cured epoxy primer designed for industrial garage and commercial showroom concrete slabs.")
                .listingPrice(new BigDecimal("1450.00"))
                .sellingPrice(new BigDecimal("1150.00"))
                .discountPercent(20)
                .stockQuantity(45)
                .imageUrl("https://images.unsplash.com/photo-1562259949-e8e7689d7828")
                .colorHex("#708090")
                .finish(PaintFinish.MATTE)
                .paintType(PaintType.PRIMER)
                .coverageSqft(new BigDecimal("150.00"))
                .sizeLiters(3.0)
                .category(primers)
                .avgRating(new BigDecimal("4.80"))
                .reviewCount(9)
                .isActive(true)
                .build());

        // 12 - 15: Enamels
        Category enamels = categories.get("enamels");
        products.add(Product.builder()
                .name("Satin Lustre Enamel")
                .slug("satin-lustre-enamel")
                .description("Silky satin finish oil enamel with outstanding scrub resistance for wooden furniture, doors, and window sills.")
                .listingPrice(new BigDecimal("790.00"))
                .sellingPrice(new BigDecimal("650.00"))
                .discountPercent(17)
                .stockQuantity(130)
                .imageUrl("https://images.unsplash.com/photo-1579783900882-c0d3dad7b119")
                .colorHex("#E6E6FA")
                .finish(PaintFinish.SATIN)
                .paintType(PaintType.ENAMEL)
                .coverageSqft(new BigDecimal("140.00"))
                .sizeLiters(1.0)
                .category(enamels)
                .avgRating(new BigDecimal("4.60"))
                .reviewCount(25)
                .isActive(true)
                .build());

        products.add(Product.builder()
                .name("Apcolite Premium Gloss Enamel")
                .slug("apcolite-premium-gloss-enamel")
                .description("High-mirror shine glossy finish enamel fortified with tough alkyd binders for long-lasting vibrant color.")
                .listingPrice(new BigDecimal("880.00"))
                .sellingPrice(new BigDecimal("720.00"))
                .discountPercent(18)
                .stockQuantity(95)
                .imageUrl("https://images.unsplash.com/photo-1579783900882-c0d3dad7b119")
                .colorHex("#003366")
                .finish(PaintFinish.GLOSS)
                .paintType(PaintType.ENAMEL)
                .coverageSqft(new BigDecimal("150.00"))
                .sizeLiters(1.0)
                .category(enamels)
                .avgRating(new BigDecimal("4.70"))
                .reviewCount(44)
                .isActive(true)
                .build());

        products.add(Product.builder()
                .name("High Gloss Synthetic Enamel")
                .slug("high-gloss-synthetic-enamel")
                .description("Quick drying solvent enamel resisting abrasion and heat; ideal for metal railings and kitchen cabinets.")
                .listingPrice(new BigDecimal("640.00"))
                .sellingPrice(new BigDecimal("520.00"))
                .discountPercent(18)
                .stockQuantity(115)
                .imageUrl("https://images.unsplash.com/photo-1579783900882-c0d3dad7b119")
                .colorHex("#2E8B57")
                .finish(PaintFinish.GLOSS)
                .paintType(PaintType.ENAMEL)
                .coverageSqft(new BigDecimal("130.00"))
                .sizeLiters(1.0)
                .category(enamels)
                .avgRating(new BigDecimal("4.45"))
                .reviewCount(18)
                .isActive(true)
                .build());

        products.add(Product.builder()
                .name("Apcolite Rust Shield Anti-Corrosive Enamel")
                .slug("apcolite-rust-shield-anti-corrosive-enamel")
                .description("Direct-to-metal zinc phosphate based anti-rust gloss enamel eliminating the need for independent red oxide.")
                .listingPrice(new BigDecimal("1200.00"))
                .sellingPrice(new BigDecimal("980.00"))
                .discountPercent(18)
                .stockQuantity(70)
                .imageUrl("https://images.unsplash.com/photo-1579783900882-c0d3dad7b119")
                .colorHex("#B22222")
                .finish(PaintFinish.GLOSS)
                .paintType(PaintType.ENAMEL)
                .coverageSqft(new BigDecimal("160.00"))
                .sizeLiters(1.0)
                .category(enamels)
                .avgRating(new BigDecimal("4.85"))
                .reviewCount(16)
                .isActive(true)
                .build());

        // 16 - 18: Waterproofing
        Category waterproofing = categories.get("waterproofing");
        products.add(Product.builder()
                .name("Damp Proof Extreme Waterproof Coat")
                .slug("damp-proof-extreme-waterproof-coat")
                .description("Elastomeric high-build waterproofing coating with synthetic fibres that bridges cracks up to 2mm.")
                .listingPrice(new BigDecimal("4200.00"))
                .sellingPrice(new BigDecimal("3400.00"))
                .discountPercent(19)
                .stockQuantity(55)
                .imageUrl("https://images.unsplash.com/photo-1600585154340-be6161a56a0c")
                .colorHex("#FFFFFF")
                .finish(PaintFinish.MATTE)
                .paintType(PaintType.WATERPROOF)
                .coverageSqft(new BigDecimal("110.00"))
                .sizeLiters(4.0)
                .category(waterproofing)
                .avgRating(new BigDecimal("4.90"))
                .reviewCount(67)
                .isActive(true)
                .build());

        products.add(Product.builder()
                .name("SmartCare Damp Block")
                .slug("smartcare-damp-block")
                .description("Polymer-modified crystalline waterproofing slurry preventing rising dampness and damp patches on interior walls.")
                .listingPrice(new BigDecimal("2300.00"))
                .sellingPrice(new BigDecimal("1890.00"))
                .discountPercent(17)
                .stockQuantity(60)
                .imageUrl("https://images.unsplash.com/photo-1600585154340-be6161a56a0c")
                .colorHex("#D3D3D3")
                .finish(PaintFinish.MATTE)
                .paintType(PaintType.WATERPROOF)
                .coverageSqft(new BigDecimal("90.00"))
                .sizeLiters(5.0)
                .category(waterproofing)
                .avgRating(new BigDecimal("4.55"))
                .reviewCount(23)
                .isActive(true)
                .build());

        products.add(Product.builder()
                .name("SmartCare Terrace Waterproofing Membrane")
                .slug("smartcare-terrace-waterproofing-membrane")
                .description("Triple-layer polyurethane and acrylic hybrid liquid membrane creating seamless flat-roof protection.")
                .listingPrice(new BigDecimal("5900.00"))
                .sellingPrice(new BigDecimal("4850.00"))
                .discountPercent(17)
                .stockQuantity(35)
                .imageUrl("https://images.unsplash.com/photo-1600585154340-be6161a56a0c")
                .colorHex("#A9A9A9")
                .finish(PaintFinish.MATTE)
                .paintType(PaintType.WATERPROOF)
                .coverageSqft(new BigDecimal("160.00"))
                .sizeLiters(10.0)
                .category(waterproofing)
                .avgRating(new BigDecimal("4.85"))
                .reviewCount(30)
                .isActive(true)
                .build());

        // 19 - 21: Wood Finishes
        Category woodFinishes = categories.get("wood-finishes");
        products.add(Product.builder()
                .name("Premium Woodstain Teak Finish")
                .slug("premium-woodstain-teak-finish")
                .description("Deep penetrating translucent wood preservative stain imparting warm rich teak luster without masking wood veins.")
                .listingPrice(new BigDecimal("1050.00"))
                .sellingPrice(new BigDecimal("850.00"))
                .discountPercent(19)
                .stockQuantity(75)
                .imageUrl("https://images.unsplash.com/photo-1538688525198-9b88f6f53126")
                .colorHex("#8B4513")
                .finish(PaintFinish.GLOSS)
                .paintType(PaintType.WOOD_FINISH)
                .coverageSqft(new BigDecimal("120.00"))
                .sizeLiters(1.0)
                .category(woodFinishes)
                .avgRating(new BigDecimal("4.70"))
                .reviewCount(29)
                .isActive(true)
                .build());

        products.add(Product.builder()
                .name("Touchwood Clear Wood Coat")
                .slug("touchwood-clear-wood-coat")
                .description("One-pack scratch-resistant transparent polyurethane varnish protecting antique furnishings and dining tables.")
                .listingPrice(new BigDecimal("950.00"))
                .sellingPrice(new BigDecimal("780.00"))
                .discountPercent(17)
                .stockQuantity(85)
                .imageUrl("https://images.unsplash.com/photo-1538688525198-9b88f6f53126")
                .colorHex("#D2B48C")
                .finish(PaintFinish.GLOSS)
                .paintType(PaintType.WOOD_FINISH)
                .coverageSqft(new BigDecimal("110.00"))
                .sizeLiters(1.0)
                .category(woodFinishes)
                .avgRating(new BigDecimal("4.65"))
                .reviewCount(18)
                .isActive(true)
                .build());

        products.add(Product.builder()
                .name("Melamyne Gloss Wood Lacquer")
                .slug("melamyne-gloss-wood-lacquer")
                .description("Two-component acid catalyst wood finish delivering high scratch, hot water, and spirit resistance.")
                .listingPrice(new BigDecimal("1480.00"))
                .sellingPrice(new BigDecimal("1200.00"))
                .discountPercent(18)
                .stockQuantity(50)
                .imageUrl("https://images.unsplash.com/photo-1538688525198-9b88f6f53126")
                .colorHex("#A0522D")
                .finish(PaintFinish.GLOSS)
                .paintType(PaintType.WOOD_FINISH)
                .coverageSqft(new BigDecimal("100.00"))
                .sizeLiters(1.0)
                .category(woodFinishes)
                .avgRating(new BigDecimal("4.80"))
                .reviewCount(12)
                .isActive(true)
                .build());

        // 22 - 25: Textures
        Category textures = categories.get("textures");
        products.add(Product.builder()
                .name("Royale Metallic Velvet Touch")
                .slug("royale-metallic-velvet-touch")
                .description("Artisan special effects designer metallic finish radiating shimmering golden reflections in ambient light.")
                .listingPrice(new BigDecimal("4600.00"))
                .sellingPrice(new BigDecimal("3850.00"))
                .discountPercent(16)
                .stockQuantity(40)
                .imageUrl("https://images.unsplash.com/photo-1507652313519-d4e9174996dd")
                .colorHex("#FFD700")
                .finish(PaintFinish.METALLIC)
                .paintType(PaintType.TEXTURE)
                .coverageSqft(new BigDecimal("140.00"))
                .sizeLiters(1.0)
                .category(textures)
                .avgRating(new BigDecimal("4.95"))
                .reviewCount(49)
                .isActive(true)
                .build());

        products.add(Product.builder()
                .name("Apex Duracast Roughtex")
                .slug("apex-duracast-roughtex")
                .description("Heavy quartz aggregate exterior textured wall finish concealing plaster imperfections with stone-like relief.")
                .listingPrice(new BigDecimal("5000.00"))
                .sellingPrice(new BigDecimal("4100.00"))
                .discountPercent(18)
                .stockQuantity(30)
                .imageUrl("https://images.unsplash.com/photo-1507652313519-d4e9174996dd")
                .colorHex("#C2B280")
                .finish(PaintFinish.TEXTURED)
                .paintType(PaintType.TEXTURE)
                .coverageSqft(new BigDecimal("80.00"))
                .sizeLiters(25.0)
                .category(textures)
                .avgRating(new BigDecimal("4.70"))
                .reviewCount(21)
                .isActive(true)
                .build());

        products.add(Product.builder()
                .name("Apex Cretex Fine Texture")
                .slug("apex-cretex-fine-texture")
                .description("Medium roller texture formulation offering flexible acrylic matrix resistant to algae and atmospheric salinity.")
                .listingPrice(new BigDecimal("4300.00"))
                .sellingPrice(new BigDecimal("3600.00"))
                .discountPercent(16)
                .stockQuantity(40)
                .imageUrl("https://images.unsplash.com/photo-1507652313519-d4e9174996dd")
                .colorHex("#BC8F8F")
                .finish(PaintFinish.TEXTURED)
                .paintType(PaintType.TEXTURE)
                .coverageSqft(new BigDecimal("95.00"))
                .sizeLiters(20.0)
                .category(textures)
                .avgRating(new BigDecimal("4.60"))
                .reviewCount(15)
                .isActive(true)
                .build());

        products.add(Product.builder()
                .name("Royale Play Dune Effect")
                .slug("royale-play-dune-effect")
                .description("Spectacular sub-Saharan dune sand patterns infused with silver mica pearls creating moving ripples of elegance.")
                .listingPrice(new BigDecimal("5400.00"))
                .sellingPrice(new BigDecimal("4600.00"))
                .discountPercent(14)
                .stockQuantity(25)
                .imageUrl("https://images.unsplash.com/photo-1507652313519-d4e9174996dd")
                .colorHex("#EEDC82")
                .finish(PaintFinish.METALLIC)
                .paintType(PaintType.TEXTURE)
                .coverageSqft(new BigDecimal("120.00"))
                .sizeLiters(1.0)
                .category(textures)
                .avgRating(new BigDecimal("4.90"))
                .reviewCount(33)
                .isActive(true)
                .build());

        productRepository.saveAll(products);
        log.info("Seeded 25 realistic paint products across 8 categories");
    }

    private void seedBanners() {
        if (bannerRepository.count() >= 5) {
            return;
        }

        List<Banner> banners = List.of(
                Banner.builder()
                        .title("Festive Color Carnival")
                        .subtitle("Transform your home with up to 25% off on all luxury interior emulsions")
                        .imageUrl("https://images.unsplash.com/photo-1589939705384-5185137a7f0f")
                        .linkUrl("/products?categoryId=1")
                        .displayOrder(1)
                        .isActive(true)
                        .build(),
                Banner.builder()
                        .title("Monsoon Ready with Damp Proof")
                        .subtitle("Ultimate 10-year waterproofing warranty for exterior walls and terraces")
                        .imageUrl("https://images.unsplash.com/photo-1600585154340-be6161a56a0c")
                        .linkUrl("/products?paintType=WATERPROOF")
                        .displayOrder(2)
                        .isActive(true)
                        .build(),
                Banner.builder()
                        .title("Luxury Royale Designer Textures")
                        .subtitle("Bring walls alive with metallic and velvet artisan textures")
                        .imageUrl("https://images.unsplash.com/photo-1507652313519-d4e9174996dd")
                        .linkUrl("/products?paintType=TEXTURE")
                        .displayOrder(3)
                        .isActive(true)
                        .build(),
                Banner.builder()
                        .title("Wood & Metal Shield")
                        .subtitle("Protect timber and metals with all-weather synthetic enamels and woodstains")
                        .imageUrl("https://images.unsplash.com/photo-1538688525198-9b88f6f53126")
                        .linkUrl("/products?paintType=WOOD_FINISH")
                        .displayOrder(4)
                        .isActive(true)
                        .build(),
                Banner.builder()
                        .title("Free Delivery on Orders Above ₹999")
                        .subtitle("Fast doorstep delivery across 500+ pin codes across India")
                        .imageUrl("https://images.unsplash.com/photo-1513694203232-719a280e022f")
                        .linkUrl("/products")
                        .displayOrder(5)
                        .isActive(true)
                        .build()
        );

        bannerRepository.saveAll(banners);
        log.info("Seeded 5 promotional banners");
    }

    private void seedCoupons() {
        if (couponRepository.count() >= 3) {
            return;
        }

        List<Coupon> coupons = List.of(
                Coupon.builder()
                        .code("WELCOME10")
                        .description("10% off on your first order")
                        .type(CouponType.PERCENT)
                        .value(new BigDecimal("10.00"))
                        .minOrderAmount(new BigDecimal("500.00"))
                        .maxDiscount(new BigDecimal("300.00"))
                        .usageLimit(1000)
                        .usedCount(0)
                        .validFrom(LocalDateTime.now().minusDays(1))
                        .validUntil(LocalDateTime.now().plusMonths(6))
                        .isActive(true)
                        .build(),
                Coupon.builder()
                        .code("FLAT200")
                        .description("Flat ₹200 off on orders above ₹1500")
                        .type(CouponType.FLAT)
                        .value(new BigDecimal("200.00"))
                        .minOrderAmount(new BigDecimal("1500.00"))
                        .maxDiscount(new BigDecimal("200.00"))
                        .usageLimit(500)
                        .usedCount(0)
                        .validFrom(LocalDateTime.now().minusDays(1))
                        .validUntil(LocalDateTime.now().plusMonths(6))
                        .isActive(true)
                        .build(),
                Coupon.builder()
                        .code("LEO15")
                        .description("15% off up to ₹500 on all paint orders")
                        .type(CouponType.PERCENT)
                        .value(new BigDecimal("15.00"))
                        .minOrderAmount(new BigDecimal("1000.00"))
                        .maxDiscount(new BigDecimal("500.00"))
                        .usageLimit(250)
                        .usedCount(0)
                        .validFrom(LocalDateTime.now().minusDays(1))
                        .validUntil(LocalDateTime.now().plusMonths(6))
                        .isActive(true)
                        .build()
        );

        couponRepository.saveAll(coupons);
        log.info("Seeded 3 discount coupons: WELCOME10, FLAT200, LEO15");
    }
}

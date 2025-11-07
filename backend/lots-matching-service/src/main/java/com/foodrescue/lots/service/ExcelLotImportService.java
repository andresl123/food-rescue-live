package com.foodrescue.lots.service;

import com.foodrescue.lots.entity.*;
import com.foodrescue.lots.repository.FoodItemRepository;
import com.foodrescue.lots.repository.LotRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExcelLotImportService {

    private final LotRepository lotRepository;
    private final FoodItemRepository foodItemRepository;

    /* ========= 1) PREVIEW ========= */
    public Mono<ImportPreviewResponse> buildPreview(byte[] excelBytes) {
        return Mono.fromCallable(() -> parseWorkbook(excelBytes))
                .map(tuple -> {
                    var lots = tuple.getT1();
                    var items = tuple.getT2();

                    var lotDtos = lots.stream()
                            .map(r -> LotPreviewDto.builder()
                                    .lotKey(r.getLotKey())
                                    .description(r.getDescription())
                                    .status(r.getStatus())
                                    .category(toCategory(r.getCategory()).name())
                                    .addressId(null)              // 👈 FE will fill this
                                    .tags(buildTagStrings(r))
                                    .build())
                            .toList();

                    var itemDtos = items.stream()
                            .map(r -> FoodItemPreviewDto.builder()
                                    .lotKey(r.getLotKey())
                                    .itemName(r.getItemName())
                                    .category(r.getCategory())
                                    .expiryDate(r.getExpiryDate() != null ? r.getExpiryDate().toString() : null)
                                    .quantity(r.getQuantity())
                                    .unitOfMeasure(r.getUnitOfMeasure())
                                    .build())
                            .toList();

                    return ImportPreviewResponse.builder()
                            .lots(lotDtos)
                            .foodItems(itemDtos)
                            .build();
                });
    }

    /* ========= 2) COMMIT (actually save) ========= */
    public Mono<ImportResult> commitImport(ImportPreviewResponse preview, String donorUserId) {

        return Flux.fromIterable(preview.getLots())
                .flatMap(row -> {
                    String lotId = java.util.UUID.randomUUID().toString();

                    Lot lot = Lot.builder()
                            .lotId(lotId)
                            .userId(donorUserId)
                            .description(row.getDescription())
                            .imageUrl("Not Available")               // 👈 always set
                            .createdAt(java.time.Instant.now())
                            .status(row.getStatus() != null ? row.getStatus() : "ACTIVE")
                            .category(toCategory(row.getCategory())) // 👈 now saved
                            .addressId(row.getAddressId())           // 👈 comes from FE in preview JSON
                            .totalItems(0)
                            .tags(convertPreviewTags(row.getTags()))
                            .build();

                    return lotRepository.save(lot)
                            .map(saved -> reactor.util.function.Tuples.of(row.getLotKey(), saved));
                })
                .collectMap(reactor.util.function.Tuple2::getT1, reactor.util.function.Tuple2::getT2)
                .flatMap(savedLotsByKey ->
                        Flux.fromIterable(preview.getFoodItems())
                                .flatMap(pi -> {
                                    Lot savedLot = savedLotsByKey.get(pi.getLotKey());
                                    if (savedLot == null) return Mono.empty();

                                    String itemId = java.util.UUID.randomUUID().toString();

                                    FoodItem item = FoodItem.builder()
                                            .itemId(itemId)
                                            .lotId(savedLot.getLotId())
                                            .itemName(pi.getItemName())
                                            .category(pi.getCategory())
                                            .expiryDate(pi.getExpiryDate() != null
                                                    ? java.time.LocalDate.parse(pi.getExpiryDate())
                                                    : null)
                                            .quantity(pi.getQuantity() != null ? pi.getQuantity() : 0)
                                            .unitOfMeasure(pi.getUnitOfMeasure())
                                            .createdAt(java.time.Instant.now())
                                            .build();

                                    return foodItemRepository.save(item);
                                })
                                .collectList()
                                .flatMap(savedItems ->
                                        updateLotTotals(savedLotsByKey.values(), savedItems)
                                                .thenReturn(
                                                        ImportResult.builder()
                                                                .lotsCreated(savedLotsByKey.size())
                                                                .itemsCreated(savedItems.size())
                                                                .warnings(java.util.Collections.emptyList())
                                                                .build()
                                                )
                                )
                );
    }

    /* ========= helpers ========= */

    private List<String> buildTagStrings(LotImportRow row) {
        List<String> list = new ArrayList<>();
        if (row.getTag1() != null && !row.getTag1().isBlank()) list.add(row.getTag1());
        if (row.getTag2() != null && !row.getTag2().isBlank()) list.add(row.getTag2());
        if (row.getTag3() != null && !row.getTag3().isBlank()) list.add(row.getTag3());
        return list;
    }

    private List<Tag> convertPreviewTags(List<String> tags) {
        if (tags == null) return List.of();
        List<Tag> out = new ArrayList<>();
        for (String t : tags) {
            if (t == null || t.isBlank()) continue;
            Tag tag = Tag.from(t);
            if (tag != null) {
                out.add(tag);
            }
        }
        return out;
    }

    private Mono<Void> updateLotTotals(Collection<Lot> lots, List<FoodItem> items) {
        Map<String, Long> countByLotId = items.stream()
                .collect(Collectors.groupingBy(FoodItem::getLotId, Collectors.counting()));

        return Flux.fromIterable(lots)
                .flatMap(lot -> {
                    Long cnt = countByLotId.get(lot.getLotId());
                    if (cnt == null) return Mono.empty();
                    lot.setTotalItems(cnt.intValue());
                    return lotRepository.save(lot).then();
                })
                .then();
    }

    /**
     * Map Excel text -> your 5 categories
     */
    private com.foodrescue.lots.entity.Category toCategory(String raw) {
        if (raw == null || raw.isBlank()) {
            return com.foodrescue.lots.entity.Category.OTHER;
        }

        String v = raw.trim().toLowerCase();

        switch (v) {
            // PRODUCE
            case "produce":
            case "fruit":
            case "fruits":
            case "vegetable":
            case "vegetables":
            case "veggies":
                return com.foodrescue.lots.entity.Category.PRODUCE;

            // DAIRY
            case "dairy":
            case "milk":
            case "cheese":
            case "yogurt":
            case "butter":
                return com.foodrescue.lots.entity.Category.DAIRY;

            // BAKERY
            case "bakery":
            case "bread":
            case "buns":
            case "pastry":
            case "pastries":
            case "cake":
            case "cookie":
            case "cookies":
                return com.foodrescue.lots.entity.Category.BAKERY;

            // MEAT
            case "meat":
            case "chicken":
            case "beef":
            case "pork":
            case "lamb":
                return com.foodrescue.lots.entity.Category.MEAT;

            // SEAFOOD
            case "seafood":
            case "fish":
            case "shrimp":
            case "prawn":
            case "salmon":
                return com.foodrescue.lots.entity.Category.SEAFOOD;

            // BEVERAGE
            case "beverage":
            case "drink":
            case "drinks":
            case "juice":
            case "water":
            case "soda":
                return com.foodrescue.lots.entity.Category.BEVERAGE;

            // PACKAGED / pantry / canned
            case "packaged":
            case "package":
            case "canned":
            case "can":
            case "dry":
            case "pantry":
                return com.foodrescue.lots.entity.Category.PACKAGED;

            // FROZEN
            case "frozen":
            case "freezer":
                return com.foodrescue.lots.entity.Category.FROZEN;

            // PREPARED / ready to eat
            case "prepared":
            case "ready to eat":
            case "ready-to-eat":
            case "meal":
            case "meals":
            case "cooked":
                return com.foodrescue.lots.entity.Category.PREPARED;

            default:
                return com.foodrescue.lots.entity.Category.OTHER;
        }
    }

    /* ========= Excel parsing (same columns as before) ========= */
    private Tuple2<List<LotImportRow>, List<FoodItemImportRow>> parseWorkbook(byte[] excelBytes) throws IOException {
        try (Workbook wb = WorkbookFactory.create(new ByteArrayInputStream(excelBytes))) {
            Sheet lotsSheet = wb.getSheet("Lots");
            Sheet itemsSheet = wb.getSheet("FoodItems");

            List<LotImportRow> lotRows = new ArrayList<>();
            List<FoodItemImportRow> itemRows = new ArrayList<>();

            if (lotsSheet != null) {
                Iterator<Row> it = lotsSheet.iterator();
                if (it.hasNext()) it.next(); // header
                while (it.hasNext()) {
                    Row r = it.next();
                    if (isRowEmpty(r)) continue;
                    lotRows.add(LotImportRow.builder()
                            .lotKey(getString(r, 0))
                            .description(getString(r, 1))
                            .status(getString(r, 2))
                            .category(getString(r, 3))
                            .addressId(getString(r, 4))
                            .tag1(getString(r, 5))
                            .tag2(getString(r, 6))
                            .tag3(getString(r, 7))
                            .build());
                }
            }

            if (itemsSheet != null) {
                Iterator<Row> it2 = itemsSheet.iterator();
                if (it2.hasNext()) it2.next();
                while (it2.hasNext()) {
                    Row r = it2.next();
                    if (isRowEmpty(r)) continue;
                    itemRows.add(FoodItemImportRow.builder()
                            .lotKey(getString(r, 0))
                            .itemName(getString(r, 1))
                            .category(getString(r, 2))
                            .expiryDate(parseLocalDate(getString(r, 3)))
                            .quantity(parseInt(getString(r, 4)))
                            .unitOfMeasure(getString(r, 5))
                            .build());
                }
            }

            return Tuples.of(lotRows, itemRows);
        }
    }

    private boolean isRowEmpty(Row row) {
        if (row == null) return true;
        for (int c = 0; c < row.getLastCellNum(); c++) {
            String v = getString(row, c);
            if (v != null && !v.isBlank()) return false;
        }
        return true;
    }

    private String getString(Row row, int idx) {
        Cell cell = row.getCell(idx);
        if (cell == null) return "";
        cell.setCellType(CellType.STRING);
        return cell.getStringCellValue().trim();
    }

    private LocalDate parseLocalDate(String s) {
        if (s == null || s.isBlank()) return null;
        return LocalDate.parse(s); // expects yyyy-MM-dd
    }

    private Integer parseInt(String s) {
        if (s == null || s.isBlank()) return null;
        return Integer.parseInt(s);
    }
}
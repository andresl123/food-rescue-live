package com.foodrescue.uibff.receiver.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * Represents a single item in a lot from:
 * - /api/v1/lots/{lotId}/items
 * Note: This API returns a direct List<ItemData>, not an object.
 * You'll deserialize this as: List<ItemData>
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ItemData {
    private String itemId;
    private String lotId;
    private String itemName;
    private String category;
    private String expiryDate; // e.g., "2025-11-05"
    private int quantity;
    private String unitOfMeasure;
    private String createdAt;
}

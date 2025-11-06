package com.foodrescue.uibff.receiver.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

/**
 * Represents a single lot object found in:
 * - /api/v1/lots/{lotId} (as 'data' object)
 * - /api/v1/lots/dashboard (as items in 'data' array)
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true) // Safely ignore fields we don't need
public class LotData {
    private String lotId;
    private String userId;
    private String description;
    private String imageUrl;
    private String createdAt;
    private String status;
    private String category;
    private int totalItems; // Note: This seems to be 0 in your data, you'll recalculate
    private String addressId;
    private List<String> tags;
}
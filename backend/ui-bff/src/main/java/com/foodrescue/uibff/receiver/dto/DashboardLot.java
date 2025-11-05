package com.foodrescue.uibff.receiver.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * The final, aggregated DTO to be sent to the UI.
 * This combines data from multiple microservices.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardLot {
    private String id;
    private String title;
    private String category;
    private String description;
    private List<String> items;
    private int totalItems;
    private List<String> tags;
    private String pickupWindow;
    private String locationName;
    private double distanceKm;
    private String expiresAt; // ISO 8601 Date String (e.g., "2025-11-02T00:00:00Z")
    private String imageUrl;
}

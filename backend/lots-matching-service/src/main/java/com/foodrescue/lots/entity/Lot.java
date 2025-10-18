package com.foodrescue.lots.entity;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Data
@Builder
@Document("lots") // Maps this class to the "lots" collection in MongoDB
public class Lot {

    @Id
    @Field("lot_id") // Maps this field to the 'lot_id' attribute in the document
    private String lotId; // Unique donation batch ID

    @Field("donor_id")
    private String userId; // Donor user who created the lot

    private String description; // Summary of the donation lot

    @Field("created_at")
    private Instant createdAt; // Date lot created

    private String status; // Current state (e.g., "OPEN", "CLOSED")

    @Field("total_items")
    private int totalItems;
}
package com.foodrescue.lots.entity;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Data
@Builder
@Document("lots")
public class Lot {

    @Id
    @Field("lot_id")
    private String lotId;

    @Field("donor_id")
    private String userId;

    private String description;

    private String imageUrl;

    @Field("created_at")
    private Instant createdAt;

    private String status;

    @Field("total_items")
    private int totalItems = 0;

    private String addressId;

}

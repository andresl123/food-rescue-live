package com.foodrescue.jobs.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "orders")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDocument {

    @Id
    private String id;  // this is also your business order_id

    private String lotId;
    private String receiverId;
    private String deliveryAddressId;
    private String pickupAddressId;
    private Instant orderDate;
    /**
     * Stored as a simple string to decouple from enums when other services evolve.
     * Common values: CREATED, IN_PROGRESS, COMPLETED, CANCELLED.
     */
    private String status;
}

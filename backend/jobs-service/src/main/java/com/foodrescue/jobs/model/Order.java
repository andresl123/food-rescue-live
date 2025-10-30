package com.foodrescue.jobs.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("orders")
public class Order {
    @Id
    private String orderId;

    private String receiverId;
    private String pickupAddressId;
    private String deliveryAddressId;
    private LocalDate orderDate;
    private String status; // pending | assigned | in_transit | delivered | cancelled

    // Optional denormalized fields for convenience
    private String recipientName;
    private String deliveryAddress;

    private Instant createdAt;
    private Instant updatedAt;
}



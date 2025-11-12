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
    private OrderStatus status;

    public enum OrderStatus {
        CREATED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }
}
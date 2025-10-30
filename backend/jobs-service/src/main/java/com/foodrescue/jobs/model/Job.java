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
@Document("jobs")
public class Job {
    @Id
    private String jobId;

    private String courierId;
    private String orderId; // FK to orders.orderId
    private String status; // assigned | pickup_pending | delivery_pending | delivered | cancelled
    private LocalDate assignedAt;
    private LocalDate completedAt;
    private String notes;

    // Denormalized convenience
    private String recipientName;
    private String deliveryAddress;

    private Instant createdAt;
    private Instant updatedAt;
}



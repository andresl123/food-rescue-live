package com.foodrescue.jobs.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "jobs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobDocument {

    @Id
    private String id;      // also your business job_id

    private String orderId; // must match order.id
    private String courierId; // can be null until assigned
    private JobStatus status;
    private Instant assignedAt;
    private Instant completedAt;
    private String notes;

    public enum JobStatus {
        UNASSIGNED,
        ASSIGNED,
        PICKUP_IN_PROGRESS,
        DELIVERY_IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }
}

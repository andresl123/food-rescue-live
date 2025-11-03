package com.foodrescue.jobs.model;

import com.foodrescue.jobs.entity.base.Auditable;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("jobs")
@EqualsAndHashCode(callSuper = false)
public class Job extends Auditable {
    @Id
    private String jobId;

    private String courierId;
    private String orderId; // FK to orders.orderId
    
    @Field("status_1")
    private String status_1; // Status for donor/pickup verification
    
    @Field("status_2")
    private String status_2; // Status for receiver/delivery verification
    
    private Instant assignedAt;
    private Instant completedAt;
    private String notes;
}



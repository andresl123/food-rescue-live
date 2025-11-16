package com.foodrescue.jobs.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("courier_stats")
public class CourierStats {

    @Id
    private String courierId;

    private long mealsDelivered;
    private long peopleHelped;
    private long totalRescues;

    private double impactScore;

    private long failedDeliveries;
    private long cancelledDeliveries;

    private Instant updatedAt;
}


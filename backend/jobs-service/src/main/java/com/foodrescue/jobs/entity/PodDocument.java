package com.foodrescue.jobs.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "pods")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PodDocument {

    @Id
    private String id;   // also your business pod_id

    private String jobId;       // must match job.id
    private String pickupOtp;
    private String deliveryOtp;
}
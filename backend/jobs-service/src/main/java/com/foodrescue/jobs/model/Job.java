package com.foodrescue.jobs.model;

import com.foodrescue.jobs.entity.base.Auditable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.TypeAlias;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("jobs")
@TypeAlias("com.foodrescue.jobs.entity.JobDocument")
@EqualsAndHashCode(callSuper = false)
public class Job extends Auditable {

    @Id
    private String jobId;

    private String courierId;
    private String orderId;
    private String status;

    private Instant assignedAt;
    private Instant completedAt;

    private String notes;
}




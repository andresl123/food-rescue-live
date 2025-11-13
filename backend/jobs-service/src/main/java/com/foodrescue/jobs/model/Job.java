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

/**
 * Canonical Job document stored in the {@code jobs} collection.
 * <p>
 * We keep a {@link TypeAlias} so that legacy documents that were persisted
 * with the old {@code com.foodrescue.jobs.entity.JobDocument} type continue
 * to deserialize without requiring a data migration.
 */
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
    
    private String status; // Job status (pending, assigned, in_progress, completed, etc.)
    
    private Instant assignedAt;
    private Instant completedAt;
    private String notes;
}



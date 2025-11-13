package com.foodrescue.evidence.entity;

import com.foodrescue.evidence.entity.base.Auditable;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("pods")
public class POD extends Auditable {

    @Id
    private String id;

    @NotNull
    @Field("job_id")
    private String jobId;

    /**
     * Verification code presented by donor during pickup.
     */
    @Field("pickup_code")
    private String pickupCode;

    /**
     * Verification code presented by receiver during delivery.
     */
    @Field("delivery_code")
    private String deliveryCode;

    @Field("pickup_generated_at")
    private Instant pickupGeneratedAt;

    @Field("delivery_generated_at")
    private Instant deliveryGeneratedAt;

    @Field("pickup_verified_at")
    private Instant pickupVerifiedAt;

    @Field("delivery_verified_at")
    private Instant deliveryVerifiedAt;

    @Field("pickup_attempts")
    private int pickupAttempts;

    @Field("delivery_attempts")
    private int deliveryAttempts;

    @Field("last_verification_method")
    private String lastVerificationMethod;
}

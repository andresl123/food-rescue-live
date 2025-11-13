package com.foodrescue.evidence.entity;

import com.foodrescue.evidence.entity.base.Auditable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Document("pods")
public class POD extends Auditable {
    
    @Id
    private String id;
    
    @NotNull
    private String jobId;
    
    @NotBlank
    private String pickupOtp;

    @NotBlank
    private String deliveryOtp;
}

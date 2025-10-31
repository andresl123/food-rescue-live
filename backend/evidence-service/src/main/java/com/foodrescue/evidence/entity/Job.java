package com.foodrescue.evidence.entity;

import com.foodrescue.evidence.entity.base.Auditable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Document("jobs")
public class Job extends Auditable {
    
    @Id
    private String id;
    
    @NotNull
    @Field("courier_id")
    private String courierId;
    
    @NotNull
    @Field("order_id")
    private String orderId;
    
    @NotBlank
    @Field("status")
    private String status;
    
    @NotNull
    @Field("assigned_at")
    private LocalDate assignedAt;
    
    @Field("completed_at")
    private LocalDate completedAt;
    
    @Field("notes")
    private String notes;
}

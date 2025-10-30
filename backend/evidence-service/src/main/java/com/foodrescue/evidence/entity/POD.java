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
    @Field("job_id")
    private String jobId;
    
    @NotBlank
    @Field("otp1")
    private String otp1;

    @NotBlank
    @Field("otp2")
    private String otp2;
}

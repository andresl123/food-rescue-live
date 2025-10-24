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
@Document("orders")
public class Order extends Auditable {
    
    @Id
    private String id;
    
    @NotNull
    @Field("receiver_id")
    private String receiverId;
    
    @NotNull
    @Field("order_date")
    private LocalDate orderDate;
    
    @NotBlank
    @Field("status")
    private String status;
}

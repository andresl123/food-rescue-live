package com.foodrescue.jobs.entity;

<<<<<<< Updated upstream
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "orders")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDocument {

    @Id
    private String id;  // this is also your business order_id
=======
import com.foodrescue.jobs.entity.base.Auditable;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
@Document("orders")
public class OrderDocument extends Auditable {

    @Id
    private String id;
>>>>>>> Stashed changes

    private String lotId;
    private String receiverId;
    private String deliveryAddressId;
    private String pickupAddressId;
    private Instant orderDate;
<<<<<<< Updated upstream
    private OrderStatus status;

    public enum OrderStatus {
        CREATED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }
}
=======
    private String status;
}

>>>>>>> Stashed changes

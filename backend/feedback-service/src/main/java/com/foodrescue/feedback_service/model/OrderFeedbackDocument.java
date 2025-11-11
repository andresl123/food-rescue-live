package com.foodrescue.feedback_service.model;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@Document("order_feedback")
public class OrderFeedbackDocument {

    @Id
    private String id;

    private String orderId;
    private String lotId;

    private int rating;
    private String feedbackText;

    // who submitted
    private String receiverId;

    private Instant createdAt;
    private Instant updatedAt;
}

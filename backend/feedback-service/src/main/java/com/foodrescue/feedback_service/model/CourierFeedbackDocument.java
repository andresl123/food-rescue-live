package com.foodrescue.feedback_service.model;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@Document("courier_feedback")
public class CourierFeedbackDocument {

    @Id
    private String id;

    private String courierId;
    private String orderId;   // optional but useful

    private int rating;
    private String feedbackText;

    private String receiverId;

    private Instant createdAt;
    private Instant updatedAt;
}

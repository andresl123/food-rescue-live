package com.foodrescue.feedback_service.repository;

import com.foodrescue.feedback_service.model.OrderFeedbackDocument;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Mono;

public interface OrderFeedbackRepository extends ReactiveMongoRepository<OrderFeedbackDocument, String> {

    // One feedback per receiver per order
    Mono<OrderFeedbackDocument> findByOrderIdAndReceiverId(String orderId, String receiverId);
}

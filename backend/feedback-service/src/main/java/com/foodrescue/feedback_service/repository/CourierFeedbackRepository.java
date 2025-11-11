package com.foodrescue.feedback_service.repository;

import com.foodrescue.feedback_service.model.CourierFeedbackDocument;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Mono;

public interface CourierFeedbackRepository extends ReactiveMongoRepository<CourierFeedbackDocument, String> {

    // One feedback per receiver per courier per order (some systems may deliver many times)
    Mono<CourierFeedbackDocument> findByCourierIdAndReceiverIdAndOrderId(String courierId, String receiverId, String orderId);
}

package com.foodrescue.feedback_service.service;

import com.foodrescue.feedback_service.dto.CourierFeedbackRequest;
import com.foodrescue.feedback_service.dto.OrderFeedbackRequest;
import com.foodrescue.feedback_service.model.CourierFeedbackDocument;
import com.foodrescue.feedback_service.model.OrderFeedbackDocument;
import com.foodrescue.feedback_service.repository.CourierFeedbackRepository;
import com.foodrescue.feedback_service.repository.OrderFeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private static final Duration UPDATE_WINDOW = Duration.ofHours(24);

    private final OrderFeedbackRepository orderFeedbackRepository;
    private final CourierFeedbackRepository courierFeedbackRepository;

    /**
     * One receiver -> one feedback per order.
     * - if feedback exists:
     *    - if within 24h -> update
     *    - else -> 403
     * - if feedback does not exist -> create
     */
    public Mono<OrderFeedbackDocument> createOrUpdateOrderFeedback(OrderFeedbackRequest req, String receiverId) {
        Instant now = Instant.now();

        return orderFeedbackRepository
                .findByOrderIdAndReceiverId(req.getOrderId(), receiverId)
                .flatMap(existing -> {
                    Instant last = existing.getUpdatedAt() != null ? existing.getUpdatedAt() : existing.getCreatedAt();
                    if (last != null && Duration.between(last, now).compareTo(UPDATE_WINDOW) > 0) {
                        return Mono.error(new ResponseStatusException(
                                HttpStatus.FORBIDDEN,
                                "You already submitted feedback for this order and the 24-hour edit window has expired."
                        ));
                    }

                    existing.setRating(req.getRating());
                    existing.setFeedbackText(req.getFeedbackText());
                    existing.setLotId(req.getLotId());
                    existing.setUpdatedAt(now);
                    return orderFeedbackRepository.save(existing);
                })
                .switchIfEmpty(
                        Mono.defer(() -> {
                            OrderFeedbackDocument doc = OrderFeedbackDocument.builder()
                                    .id(UUID.randomUUID().toString())
                                    .orderId(req.getOrderId())
                                    .lotId(req.getLotId())
                                    .rating(req.getRating())
                                    .feedbackText(req.getFeedbackText())
                                    .receiverId(receiverId)
                                    .createdAt(now)
                                    .updatedAt(now)
                                    .build();
                            return orderFeedbackRepository.save(doc);
                        })
                );
    }

    /**
     * One receiver -> one feedback per courier per order.
     */
    public Mono<CourierFeedbackDocument> createOrUpdateCourierFeedback(CourierFeedbackRequest req, String receiverId) {
        Instant now = Instant.now();
        String orderId = req.getOrderId() != null ? req.getOrderId() : "_none_";

        return courierFeedbackRepository
                .findByCourierIdAndReceiverIdAndOrderId(req.getCourierId(), receiverId, orderId)
                .flatMap(existing -> {
                    Instant last = existing.getUpdatedAt() != null ? existing.getUpdatedAt() : existing.getCreatedAt();
                    if (last != null && Duration.between(last, now).compareTo(UPDATE_WINDOW) > 0) {
                        return Mono.error(new ResponseStatusException(
                                HttpStatus.FORBIDDEN,
                                "You already submitted feedback for this courier on this order and the 24-hour edit window has expired."
                        ));
                    }

                    existing.setRating(req.getRating());
                    existing.setFeedbackText(req.getFeedbackText());
                    existing.setUpdatedAt(now);
                    return courierFeedbackRepository.save(existing);
                })
                .switchIfEmpty(
                        Mono.defer(() -> {
                            CourierFeedbackDocument doc = CourierFeedbackDocument.builder()
                                    .id(UUID.randomUUID().toString())
                                    .courierId(req.getCourierId())
                                    .orderId(orderId.equals("_none_") ? null : orderId)
                                    .rating(req.getRating())
                                    .feedbackText(req.getFeedbackText())
                                    .receiverId(receiverId)
                                    .createdAt(now)
                                    .updatedAt(now)
                                    .build();
                            return courierFeedbackRepository.save(doc);
                        })
                );
    }

    /* ---------- NEW: read endpoints for prefill ---------- */

    public Mono<OrderFeedbackDocument> getOrderFeedback(String orderId, String receiverId) {
        return orderFeedbackRepository.findByOrderIdAndReceiverId(orderId, receiverId);
    }

    public Mono<CourierFeedbackDocument> getCourierFeedback(String orderId, String courierId, String receiverId) {
        return courierFeedbackRepository.findByCourierIdAndReceiverIdAndOrderId(courierId, receiverId, orderId);
    }
}

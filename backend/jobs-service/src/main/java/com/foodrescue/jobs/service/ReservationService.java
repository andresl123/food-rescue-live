package com.foodrescue.jobs.service;

import com.foodrescue.jobs.dto.ReserveLotRequest;
import com.foodrescue.jobs.entity.OrderDocument;
import com.foodrescue.jobs.model.Job;
import com.foodrescue.jobs.repository.JobRepository;
import com.foodrescue.jobs.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final OrderRepository orderRepository;
    private final JobRepository jobRepository;

    public Mono<ReservationResult> reserveLot(ReserveLotRequest request, String receiverId) {

        return orderRepository
                // any order for this user with status != DELIVERED?
                .existsByReceiverIdAndStatusNotIgnoreCase(receiverId, "DELIVERED")
                .flatMap(hasActiveUndelivered -> {
                    if (Boolean.TRUE.equals(hasActiveUndelivered)) {
                        // Business rule: one active (non-delivered) order per receiver
                        return Mono.error(new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "You already have an active order pending delivery. Please complete it before reserving another lot."
                        ));
                    }

                    // No active undelivered orders → proceed with reservation
                    String orderId = UUID.randomUUID().toString();
                    String jobId = UUID.randomUUID().toString();

                    OrderDocument order = OrderDocument.builder()
                            .id(orderId)
                            .lotId(request.getLotId())
                            .receiverId(receiverId)
                            .deliveryAddressId(request.getDeliveryAddressId())
                            .pickupAddressId(request.getPickupAddressId())
                            .orderDate(Instant.now())
                            .status("CREATED")
                            .build();

                    return orderRepository.save(order)
                            .flatMap(savedOrder -> {
                                Job job = Job.builder()
                                        .jobId(jobId)
                                        .orderId(savedOrder.getId())
                                        .status("UNASSIGNED")
                                        .notes("Auto-created for lot reservation")
                                        .build();

                                return jobRepository.save(job)
                                        .map(savedJob -> new ReservationResult(savedOrder, savedJob));
                            });
                });
    }

    // still here if you need later
    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int num = 100000 + random.nextInt(900000);
        return String.valueOf(num);
    }

    // updated result: only order + job
    public record ReservationResult(
            OrderDocument order,
            Job job
    ) {}
}

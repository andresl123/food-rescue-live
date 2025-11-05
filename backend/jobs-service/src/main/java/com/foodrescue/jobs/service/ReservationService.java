package com.foodrescue.jobs.service;

import com.foodrescue.jobs.dto.ReserveLotRequest;
import com.foodrescue.jobs.entity.JobDocument;
import com.foodrescue.jobs.entity.OrderDocument;
import com.foodrescue.jobs.entity.PodDocument;
import com.foodrescue.jobs.repository.JobRepository;
import com.foodrescue.jobs.repository.OrderRepository;
import com.foodrescue.jobs.repository.PodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final OrderRepository orderRepository;
    private final JobRepository jobRepository;
    private final PodRepository podRepository;

    public Mono<ReservationResult> reserveLot(ReserveLotRequest request, String receiverId) {
        // create ids
        String orderId = UUID.randomUUID().toString();
        String jobId = UUID.randomUUID().toString();
        String podId = UUID.randomUUID().toString();

        // 1) build order
        OrderDocument order = OrderDocument.builder()
                .id(orderId) // same for mongo & business
                .lotId(request.getLotId())
                .receiverId(receiverId)
                .deliveryAddressId(request.getDeliveryAddressId())
                .pickupAddressId(request.getPickupAddressId())
                .orderDate(Instant.now())
                .status(OrderDocument.OrderStatus.CREATED)
                .build();

        return orderRepository.save(order)
                .flatMap(savedOrder -> {
                    // 2) build job
                    JobDocument job = JobDocument.builder()
                            .id(jobId)
                            .orderId(savedOrder.getId()) // link to order
                            .courierId(null)
                            .status(JobDocument.JobStatus.UNASSIGNED)
                            .assignedAt(null)
                            .completedAt(null)
                            .notes("Auto-created for lot reservation")
                            .build();

                    return jobRepository.save(job)
                            .flatMap(savedJob -> {
                                // 3) build POD
                                PodDocument pod = PodDocument.builder()
                                        .id(podId)
                                        .jobId(savedJob.getId())
                                        .pickupOtp(generateOtp())
                                        .deliveryOtp(generateOtp())
                                        .build();

                                return podRepository.save(pod)
                                        .map(savedPod -> new ReservationResult(savedOrder, savedJob, savedPod));
                            });
                });
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int num = 100000 + random.nextInt(900000);
        return String.valueOf(num);
    }

    public record ReservationResult(
            OrderDocument order,
            JobDocument job,
            PodDocument pod
    ) {}
}

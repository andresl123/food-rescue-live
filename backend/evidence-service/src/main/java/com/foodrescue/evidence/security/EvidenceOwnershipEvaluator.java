package com.foodrescue.evidence.security;

import com.foodrescue.evidence.entity.Job;
import com.foodrescue.evidence.entity.Order;
import com.foodrescue.evidence.entity.POD;
import com.foodrescue.evidence.repository.JobRepository;
import com.foodrescue.evidence.repository.OrderRepository;
import com.foodrescue.evidence.repository.PODRepository;
import com.foodrescue.security.ownership.OwnershipEvaluator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/**
 * Implements RBAC-Starter's OwnershipEvaluator for the Evidence Service.
 *
 * Resource types:
 *  - "JOB"   : owner = job.courierId OR receiver of related order
 *  - "ORDER" : owner = order.receiverId
 *  - "POD"   : owner = courier of pod.jobId OR receiver of related order
 */
@Component
@RequiredArgsConstructor
public class EvidenceOwnershipEvaluator implements OwnershipEvaluator {

    private final JobRepository jobRepo;
    private final OrderRepository orderRepo;
    private final PODRepository podRepo;

    @Override
    public Mono<Boolean> owns(String resourceType, String resourceId, String userId) {
        if (resourceType == null || resourceId == null || userId == null) {
            return Mono.just(false);
        }
        return switch (resourceType.toUpperCase()) {
            case "JOB"   -> ownsJob(resourceId, userId);
            case "ORDER" -> ownsOrder(resourceId, userId);
            case "POD"   -> ownsPod(resourceId, userId);
            default      -> Mono.just(false);
        };
    }

    private Mono<Boolean> ownsJob(String jobId, String userId) {
        return jobRepo.findById(jobId)
                .flatMap(job -> {
                    if (userId.equals(job.getCourierId())) return Mono.just(true);
                    // also allow receiver who owns the related order
                    return orderRepo.findById(job.getOrderId())
                            .map(order -> userId.equals(order.getReceiverId()))
                            .defaultIfEmpty(false);
                })
                .defaultIfEmpty(false);
    }

    private Mono<Boolean> ownsOrder(String orderId, String userId) {
        return orderRepo.findById(orderId)
                .map(order -> userId.equals(order.getReceiverId()))
                .defaultIfEmpty(false);
    }

    private Mono<Boolean> ownsPod(String podId, String userId) {
        return podRepo.findById(podId)
                .flatMap(pod -> jobRepo.findById(pod.getJobId())
                        .flatMap(job -> {
                            if (userId.equals(job.getCourierId())) return Mono.just(true);
                            return orderRepo.findById(job.getOrderId())
                                    .map(order -> userId.equals(order.getReceiverId()))
                                    .defaultIfEmpty(false);
                        }))
                .defaultIfEmpty(false);
    }
}

package com.foodrescue.jobs.service;

import com.foodrescue.jobs.model.CourierStats;
import com.foodrescue.jobs.repository.CourierStatsRepository;
import com.foodrescue.jobs.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourierStatsService {

    private static final long PEOPLE_PER_RESCUE = 3;

    private final CourierStatsRepository statsRepository;
    private final JobRepository jobRepository;

    public Mono<CourierStats> getStats(String courierId) {
        if (courierId == null || courierId.isBlank()) {
            return Mono.empty();
        }
        return statsRepository.findById(courierId)
                .switchIfEmpty(recomputeStats(courierId));
    }

    public Mono<CourierStats> recomputeStats(String courierId) {
        if (courierId == null || courierId.isBlank()) {
            return Mono.empty();
        }

        Mono<Long> delivered = jobRepository.findByCourierIdAndStatus(courierId, "DELIVERED").count();
        Mono<Long> failed = jobRepository.findByCourierIdAndStatus(courierId, "FAILED").count();
        Mono<Long> cancelled = jobRepository.findByCourierIdAndStatus(courierId, "CANCELLED").count();
        Mono<Long> returned = jobRepository.findByCourierIdAndStatus(courierId, "RETURNED").count();

        return Mono.zip(delivered.defaultIfEmpty(0L),
                        failed.defaultIfEmpty(0L),
                        cancelled.defaultIfEmpty(0L),
                        returned.defaultIfEmpty(0L))
                .flatMap(tuple -> {
                    long deliveredCount = tuple.getT1();
                    long failedCount = tuple.getT2();
                    long cancelledCount = tuple.getT3();
                    long returnedCount = tuple.getT4();

                    long mealsDelivered = deliveredCount;
                    long peopleHelped = Math.max(deliveredCount * PEOPLE_PER_RESCUE, mealsDelivered);
                    long totalRescues = deliveredCount;

                    double impactScore = computeImpactScore(deliveredCount, failedCount, cancelledCount, returnedCount);

                    CourierStats stats = CourierStats.builder()
                            .courierId(courierId)
                            .mealsDelivered(mealsDelivered)
                            .peopleHelped(peopleHelped)
                            .totalRescues(totalRescues)
                            .impactScore(impactScore)
                            .failedDeliveries(failedCount)
                            .cancelledDeliveries(cancelledCount)
                            .updatedAt(Instant.now())
                            .build();

                    return statsRepository.save(stats);
                })
                .doOnError(error -> log.error("Failed to recompute stats for courier {}", courierId, error));
    }

    public Mono<Void> refreshForCourier(String courierId) {
        if (courierId == null || courierId.isBlank()) {
            return Mono.empty();
        }
        return recomputeStats(courierId).then();
    }

    private double computeImpactScore(long delivered, long failed, long cancelled, long returned) {
        long totalAttempts = delivered + failed + cancelled + returned;
        if (totalAttempts == 0) {
            return 4.5;
        }
        double successRatio = delivered / (double) totalAttempts;
        double base = 3.5 + successRatio * 1.5; // between 3.5 and 5.0
        double penalty = (failed * 0.15) + (cancelled * 0.1) + (returned * 0.05);
        double impact = Math.max(0.0, Math.min(5.0, base - penalty));
        return Math.round(impact * 10.0) / 10.0;
    }
}


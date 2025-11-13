package com.foodrescue.jobs.service;

import com.foodrescue.jobs.model.Job;
import com.foodrescue.jobs.model.JobStatus;
import com.foodrescue.jobs.entity.OrderDocument;
import com.foodrescue.jobs.repository.JobRepository;
import com.foodrescue.jobs.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderQueryService {

    private final OrderRepository orderRepository;
    private final JobRepository jobRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ISO_INSTANT;

    public Mono<OrdersPage> getOrdersForReceiver(String receiverId) {
        // if you make a repo method: orderRepository.findByReceiverId(receiverId)
        // you can replace this filtering with that
        Flux<OrderDocument> ordersForReceiver = orderRepository.findAll()
                .filter(o -> receiverId.equals(o.getReceiverId()));

        return ordersForReceiver
                .flatMap(order ->
                        jobRepository.findByOrderId(order.getId())
                                // ✅ don't pass null here
                                .switchIfEmpty(Mono.empty())
                                // map job (or empty) to row
                                .map(job -> toOrderRow(order, job))
                                // if the job was empty, we still need to emit a row (with "To be assigned")
                                .defaultIfEmpty(toOrderRow(order, null))
                )
                .collectList()
                .map(rows -> {
                    List<OrderRow> current = rows.stream()
                            .filter(r -> r.status() == null || !"COMPLETED".equalsIgnoreCase(r.status()))
                            .toList();

                    List<OrderRow> completed = rows.stream()
                            .filter(r -> "COMPLETED".equalsIgnoreCase(r.status()))
                            .toList();

                    return new OrdersPage(current, completed);
                });
    }

    private OrderRow toOrderRow(OrderDocument order, Job job) {
        String courierId = "To be assigned";
        if (job != null && job.getStatus() != null &&
                !JobStatus.ASSIGNED.equalsIgnoreCase(job.getStatus())) {
            courierId = job.getCourierId();
        }

        return new OrderRow(
                order.getId(),
                order.getOrderDate() != null ? DATE_FMT.format(order.getOrderDate()) : null,
                order.getStatus() != null ? order.getStatus().name() : null,
                order.getLotId(),
                order.getPickupAddressId(),
                order.getReceiverId(),
                order.getDeliveryAddressId(),
                courierId
        );
    }

    // DTOs
    public record OrdersPage(List<OrderRow> current, List<OrderRow> completed) {}

    public record OrderRow(
            String id,
            String date,
            String status,
            String lot_id,
            String donor_address,
            String receiver_id,
            String recipient_address,
            String courier_id
    ) {}
}

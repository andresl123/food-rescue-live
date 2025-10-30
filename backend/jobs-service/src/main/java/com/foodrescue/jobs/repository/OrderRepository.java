package com.foodrescue.jobs.repository;

import com.foodrescue.jobs.model.Order;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;

public interface OrderRepository extends ReactiveMongoRepository<Order, String> {
    Flux<Order> findByReceiverId(String receiverId);
    Flux<Order> findByStatus(String status);
}



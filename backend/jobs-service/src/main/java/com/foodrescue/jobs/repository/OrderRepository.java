package com.foodrescue.jobs.repository;

import com.foodrescue.jobs.entity.OrderDocument;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

public interface OrderRepository extends ReactiveMongoRepository<OrderDocument, String> {
}

package com.foodrescue.lots.repository;

import com.foodrescue.lots.entity.Lot;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface LotRepository extends ReactiveMongoRepository<Lot, String> {
    Flux<Lot> findByUserId(String userId);
}
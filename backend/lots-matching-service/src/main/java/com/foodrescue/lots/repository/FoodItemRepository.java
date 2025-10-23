package com.foodrescue.lots.repository;

import com.foodrescue.lots.entity.FoodItem;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

@Repository
public interface FoodItemRepository extends ReactiveMongoRepository<FoodItem, String> {
    /**
     * Deletes all FoodItem documents that have the specified lotId.
     */
    Mono<Void> deleteByLotId(String lotId);
}
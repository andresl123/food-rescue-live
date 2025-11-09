package com.foodrescue.lots.repository;

import com.foodrescue.lots.entity.FoodItem;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface FoodItemRepository extends ReactiveMongoRepository<FoodItem, String> {
    /**
     * Deletes all FoodItem documents that have the specified lotId.
     */
    Mono<Void> deleteByLotId(String lotId);
    Flux<FoodItem> findByLotId(String lotId);
    Flux<FoodItem> findByLotIdIn(List<String> lotIds);
    Flux<FoodItem> findByExpiryDateBetween(LocalDate startDate, LocalDate endDate);
}
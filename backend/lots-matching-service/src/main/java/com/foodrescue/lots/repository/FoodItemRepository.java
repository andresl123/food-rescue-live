package com.foodrescue.lots.repository;

import com.foodrescue.lots.entity.FoodItem;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FoodItemRepository extends ReactiveMongoRepository<FoodItem, String> {
}

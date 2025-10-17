package com.foodrescue.lots.repository;

import com.foodrescue.lots.entity.Lot;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LotRepository extends ReactiveMongoRepository<Lot, String> {
}
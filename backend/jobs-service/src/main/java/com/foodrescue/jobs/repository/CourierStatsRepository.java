package com.foodrescue.jobs.repository;

import com.foodrescue.jobs.model.CourierStats;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

public interface CourierStatsRepository extends ReactiveMongoRepository<CourierStats, String> {
}


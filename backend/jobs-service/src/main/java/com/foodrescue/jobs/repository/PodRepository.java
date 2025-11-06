package com.foodrescue.jobs.repository;

import com.foodrescue.jobs.entity.PodDocument;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

public interface PodRepository extends ReactiveMongoRepository<PodDocument, String> {
}

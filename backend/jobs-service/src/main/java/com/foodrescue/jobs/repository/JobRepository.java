package com.foodrescue.jobs.repository;

import com.foodrescue.jobs.entity.JobDocument;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

public interface JobRepository extends ReactiveMongoRepository<JobDocument, String> {
}

package com.foodrescue.jobs.config;

import com.foodrescue.jobs.model.Job;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import reactor.core.publisher.Mono;

@Configuration
@Slf4j
public class JobsCollectionInitializer {

    @Bean
    public ApplicationRunner ensureJobsCollection(ReactiveMongoTemplate mongoTemplate) {
        return args -> mongoTemplate
                .collectionExists(Job.class)
                .flatMap(exists -> exists
                        ? Mono.fromRunnable(() -> log.info("Mongo collection 'jobs' already exists."))
                        : mongoTemplate.createCollection(Job.class)
                                .doOnSuccess(c -> log.info("Mongo collection 'jobs' created.")))
                .onErrorResume(err -> {
                    log.error("Failed to ensure 'jobs' collection exists", err);
                    return Mono.empty();
                })
                .subscribe();
    }
}


package com.foodrescue.evidence.config;

import com.foodrescue.evidence.entity.POD;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import reactor.core.publisher.Mono;

@Configuration
@Slf4j
public class PodsCollectionInitializer {

    @Bean
    public ApplicationRunner ensurePodsCollection(ReactiveMongoTemplate mongoTemplate) {
        return args -> mongoTemplate
                .collectionExists(POD.class)
                .flatMap(exists -> exists
                        ? Mono.fromRunnable(() -> log.info("Mongo collection 'pods' already exists."))
                        : mongoTemplate.createCollection(POD.class)
                                .doOnSuccess(c -> log.info("Mongo collection 'pods' created.")))
                .onErrorResume(err -> {
                    log.error("Failed to ensure 'pods' collection exists", err);
                    return Mono.empty();
                })
                .subscribe();
    }
}



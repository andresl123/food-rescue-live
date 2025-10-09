package com.foodrescue.auth.repository;

import com.foodrescue.auth.entity.User;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Mono;

public interface UserRepository extends ReactiveMongoRepository<User, String> {
    Mono<User> findByEmail(String email);
    Mono<Boolean> existsByEmail(String email);
    Mono<Boolean> existsByPhoneNumber(String phoneNumber);
}

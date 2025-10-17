package com.foodrescue.auth.repository;

import com.foodrescue.auth.entity.Address;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Mono;

public interface AddressRepository extends ReactiveMongoRepository<Address, String> {
    // Optionally, you can add custom queries later
    Mono<Address> findByCity(String city);
}

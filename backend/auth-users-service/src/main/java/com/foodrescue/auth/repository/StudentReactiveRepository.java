package com.foodrescue.auth.repository;

import com.foodrescue.auth.entity.Student;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;

public interface StudentReactiveRepository extends ReactiveMongoRepository<Student, String> {
    Flux<Student> findByAge(int age);
}

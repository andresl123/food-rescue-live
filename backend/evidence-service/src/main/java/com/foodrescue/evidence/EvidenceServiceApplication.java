package com.foodrescue.evidence;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableReactiveMongoAuditing;

@SpringBootApplication
@EnableReactiveMongoAuditing
public class EvidenceServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(EvidenceServiceApplication.class, args);
    }
}
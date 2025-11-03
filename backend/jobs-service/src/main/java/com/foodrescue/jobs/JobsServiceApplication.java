package com.foodrescue.jobs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableReactiveMongoAuditing;

@SpringBootApplication
@EnableReactiveMongoAuditing
public class JobsServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(JobsServiceApplication.class, args);
	}

}

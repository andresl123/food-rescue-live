package com.foodrescue.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableReactiveMongoAuditing;

@SpringBootApplication
@EnableReactiveMongoAuditing
public class AuthUsersServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AuthUsersServiceApplication.class, args);
	}

}

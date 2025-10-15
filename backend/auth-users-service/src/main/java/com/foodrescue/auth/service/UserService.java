package com.foodrescue.auth.service;

import com.foodrescue.auth.entity.User;
import com.foodrescue.auth.repository.UserRepository;
import com.foodrescue.auth.web.request.UserCreateRequest;
import com.foodrescue.auth.web.response.UserResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Service
public class UserService {

    private final UserRepository repo;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository repo, PasswordEncoder passwordEncoder) {

        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
    }

    public Mono<UserResponse> create(UserCreateRequest req) {
        // Validate uniqueness reactively, then hash password on a worker thread
        Mono<Void> uniquenessChecks =
                repo.existsByEmail(req.email())
                        .flatMap(exists -> exists ? Mono.error(new IllegalArgumentException("Email already in use")) : Mono.empty())
                        .then(
                                req.phoneNumber() == null || req.phoneNumber().isBlank()
                                        ? Mono.empty()
                                        : repo.existsByPhoneNumber(req.phoneNumber())
                                        .flatMap(exists -> exists ? Mono.error(new IllegalArgumentException("Phone already in use")) : Mono.empty())
                        );

        Mono<String> hashed =
                Mono.fromCallable(() -> passwordEncoder.encode(req.password()))
                        .subscribeOn(Schedulers.boundedElastic());

        return uniquenessChecks
                .then(hashed)
                .map(pw -> User.builder()
                        .name(req.name())
                        .email(req.email().toLowerCase())
                        .password(pw)
                        .categoryId(req.categoryId())
                        .phoneNumber(req.phoneNumber())
                        .defaultAddressId(req.defaultAddressId())
                        .roles(req.roles() == null || req.roles().isEmpty() ? null : req.roles())
                        .build()
                )
                .flatMap(repo::save)
                .map(this::toResponse);
    }

    public Mono<UserResponse> get(String id) {
        return repo.findById(id)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("User not found")))
                .map(this::toResponse);
    }

    private UserResponse toResponse(User u) {
        return new UserResponse(
                u.getId(), u.getName(), u.getEmail(), u.getCategoryId(),
                u.getPhoneNumber(), u.getDefaultAddressId(), u.getRoles(),
                u.getStatus(), u.getCreatedAt(), u.getUpdatedAt()
        );
    }
}

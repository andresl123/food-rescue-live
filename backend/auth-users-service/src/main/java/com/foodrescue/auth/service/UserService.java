package com.foodrescue.auth.service;

import com.foodrescue.auth.entity.User;
import com.foodrescue.auth.repository.UserRepository;
import com.foodrescue.auth.web.request.UserCreateRequest;
import com.foodrescue.auth.web.response.UserResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import java.util.Optional;
import java.util.Set;
import reactor.core.scheduler.Schedulers;
import com.foodrescue.auth.web.request.UserUpdateRequest;
import reactor.core.publisher.Flux;

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
                        .roles(Optional.ofNullable(req.roles())
                                .filter(r -> !r.isEmpty())
                                .orElse(Set.of(req.categoryId()))
                        )
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

    // Get All Users
    public Flux<UserResponse> getAllUsers() {
        return repo.findAll()
                .map(this::toResponse);
    }

    // Update User (for Admin)
    public Mono<UserResponse> updateUser(String id, UserUpdateRequest req) {
        return repo.findById(id)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("User not found")))
                .flatMap(user -> {
                    // Check if email is being changed
                    if (!user.getEmail().equalsIgnoreCase(req.email())) {
                        // Email is changing, we MUST check for uniqueness
                        return repo.existsByEmail(req.email().toLowerCase())
                                .flatMap(exists -> {
                                    if (exists) {
                                        // New email is already taken, throw error
                                        return Mono.error(new IllegalArgumentException("Email already in use."));
                                    }
                                    // Email is new and unique, proceed with update
                                    return updateAndSaveUser(user, req);
                                });
                    } else {
                        // Email is not changing, just update other fields
                        return updateAndSaveUser(user, req);
                    }
                })
                .map(this::toResponse);
    }

    /**
     * Helper method to apply updates and save the user.
     */
    private Mono<User> updateAndSaveUser(User user, UserUpdateRequest req) {
        user.setName(req.name());
        user.setEmail(req.email().toLowerCase()); // Set new name and email
        user.setRoles(req.roles());
        user.setStatus(req.status());
        return repo.save(user);
    }

    // Delete User
    public Mono<Void> deleteUser(String id) {
        return repo.findById(id)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("User not found")))
                .flatMap(repo::delete);
    }

    private UserResponse toResponse(User u) {
        return new UserResponse(
                u.getId(), u.getName(), u.getEmail(), u.getCategoryId(),
                u.getPhoneNumber(), u.getDefaultAddressId(), u.getRoles(),
                u.getStatus(), u.getCreatedAt(), u.getUpdatedAt()
        );
    }
}

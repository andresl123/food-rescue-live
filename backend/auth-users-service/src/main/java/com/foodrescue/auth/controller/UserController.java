package com.foodrescue.auth.controller;

import com.foodrescue.auth.service.UserService;
import com.foodrescue.auth.web.request.UserCreateRequest;
import com.foodrescue.auth.web.response.ApiResponse;
import com.foodrescue.auth.web.response.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) { this.service = service; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ApiResponse<UserResponse>> create(@Valid @RequestBody UserCreateRequest req) {
        return service.create(req).map(ApiResponse::created);
    }

    @GetMapping("/{id}")
    public Mono<ApiResponse<UserResponse>> get(@PathVariable String id) {
        return service.get(id).map(ApiResponse::ok);
    }
}

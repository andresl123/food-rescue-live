package com.foodrescue.jobs.controller;

import com.foodrescue.jobs.model.Order;
import com.foodrescue.jobs.service.OrderService;
import com.foodrescue.jobs.web.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/orders")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService service;

    @PostMapping
    public Mono<ResponseEntity<ApiResponse<Order>>> create(@RequestBody Order order) {
        return service.create(order).map(ResponseEntity::ok);
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<ApiResponse<Order>>> get(@PathVariable String id) {
        return service.getById(id).map(ResponseEntity::ok);
    }

    @GetMapping("/receiver/{receiverId}")
    public Flux<Order> byReceiver(@PathVariable String receiverId) {
        return service.getByReceiverId(receiverId);
    }

    @GetMapping("/status/{status}")
    public Flux<Order> byStatus(@PathVariable String status) {
        return service.getByStatus(status);
    }

    @PutMapping("/{id}/status")
    public Mono<ResponseEntity<ApiResponse<Order>>> updateStatus(@PathVariable String id, @RequestParam String status) {
        return service.updateStatus(id, status).map(ResponseEntity::ok);
    }

    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<ApiResponse<Void>>> delete(@PathVariable String id) {
        return service.delete(id).map(ResponseEntity::ok);
    }
}



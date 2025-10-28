package com.foodrescue.evidence.controller;

import com.foodrescue.evidence.service.OrderService;
import com.foodrescue.evidence.web.request.OrderCreateRequest;
import com.foodrescue.evidence.web.response.ApiResponse;
import com.foodrescue.evidence.web.response.OrderResponse;
import jakarta.validation.Valid;
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
    
    private final OrderService orderService;
    
    @PostMapping
    public Mono<ResponseEntity<ApiResponse<OrderResponse>>> create(@Valid @RequestBody OrderCreateRequest request) {
        return orderService.create(request)
                .map(ResponseEntity::ok);
    }
    
    @GetMapping("/{id}")
    public Mono<ResponseEntity<ApiResponse<OrderResponse>>> getById(@PathVariable String id) {
        return orderService.getById(id)
                .map(ResponseEntity::ok);
    }
    
    @GetMapping("/receiver/{receiverId}/status/{status}")
    public Mono<ResponseEntity<ApiResponse<OrderResponse>>> getByReceiverIdAndStatus(
            @PathVariable String receiverId, 
            @PathVariable String status) {
        return orderService.getByReceiverIdAndStatus(receiverId, status)
                .map(ResponseEntity::ok);
    }
    
    @GetMapping("/receiver/{receiverId}")
    public Flux<OrderResponse> getByReceiverId(@PathVariable String receiverId) {
        return orderService.getByReceiverId(receiverId);
    }
    
    @GetMapping("/status/{status}")
    public Flux<OrderResponse> getByStatus(@PathVariable String status) {
        return orderService.getByStatus(status);
    }
    
    @PutMapping("/{id}/status")
    public Mono<ResponseEntity<ApiResponse<OrderResponse>>> updateStatus(
            @PathVariable String id, 
            @RequestParam String status) {
        return orderService.updateStatus(id, status)
                .map(ResponseEntity::ok);
    }
    
    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<ApiResponse<Void>>> delete(@PathVariable String id) {
        return orderService.delete(id)
                .map(ResponseEntity::ok);
    }
}

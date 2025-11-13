package com.foodrescue.jobs.controller;

import com.foodrescue.jobs.entity.OrderDocument;
import com.foodrescue.jobs.model.Job;
import com.foodrescue.jobs.service.JobService;
import com.foodrescue.jobs.web.response.AddressDto;
import com.foodrescue.jobs.web.response.ApiResponse;
import com.foodrescue.jobs.web.response.UserDto;
import com.foodrescue.jobs.web.response.UserNameDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/jobs")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class JobController {

    private final JobService service;

    @PostMapping
    public Mono<ResponseEntity<ApiResponse<Job>>> create(@RequestBody Job job) {
        return service.create(job).map(ResponseEntity::ok);
    }

    @PostMapping("/create-from-order/{orderId}")
    public Mono<ResponseEntity<ApiResponse<Job>>> createFromOrder(@PathVariable String orderId) {
        return service.createFromOrderId(orderId).map(ResponseEntity::ok);
    }

    @GetMapping
    public Flux<Job> getAll() {
        return service.getAllJobs();
    }

    @GetMapping("/orders/details/{orderId}")
    public Mono<ResponseEntity<ApiResponse<OrderDocument>>> getOrderDetails(@PathVariable String orderId) {
        return service.getOrderById(orderId).map(ResponseEntity::ok);
    }

    @GetMapping("/orders/details/{orderId}/receiver")
    public Mono<ResponseEntity<ApiResponse<UserDto>>> getOrderReceiver(@PathVariable String orderId) {
        return service.getReceiverForOrder(orderId).map(ResponseEntity::ok);
    }

    @GetMapping("/users/{userId}")
    public Mono<ResponseEntity<ApiResponse<UserNameDto>>> getUserById(@PathVariable String userId) {
        return service.getUserById(userId).map(ResponseEntity::ok);
    }

    @GetMapping("/address/{addressId}")
    public Mono<ResponseEntity<ApiResponse<AddressDto>>> getAddressById(@PathVariable String addressId) {
        return service.getAddressById(addressId).map(ResponseEntity::ok);
    }

    // Specific routes must come before path variable routes
    @GetMapping("/available")
    public Flux<Job> getAvailableJobs() {
        return service.getAvailableJobs();
    }

    @GetMapping("/order/{orderId}")
    public Flux<Job> byOrder(@PathVariable String orderId) { return service.getByOrderId(orderId); }

    @GetMapping("/status/{status}")
    public Flux<Job> byStatus(@PathVariable String status) { return service.getByStatus(status); }

    @GetMapping("/courier/{courierId}")
    public Flux<Job> byCourier(@PathVariable String courierId) { return service.getByCourierId(courierId); }

    @GetMapping("/courier/{courierId}/status/{status}")
    public Flux<Job> byCourierAndStatus(@PathVariable String courierId, @PathVariable String status) {
        return service.getByCourierIdAndStatus(courierId, status);
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<ApiResponse<Job>>> get(@PathVariable String id) {
        return service.getById(id).map(ResponseEntity::ok);
    }

    @PutMapping("/{id}/status")
    public Mono<ResponseEntity<ApiResponse<Job>>> updateStatus(@PathVariable String id, @RequestParam String status) {
        return service.updateStatus(id, status).map(ResponseEntity::ok);
    }

    @PutMapping("/{jobId}/assign-courier/{courierId}")
    public Mono<ResponseEntity<ApiResponse<Job>>> assignCourier(@PathVariable String jobId, @PathVariable String courierId) {
        return service.assignCourier(jobId, courierId).map(ResponseEntity::ok);
    }

    @PutMapping("/{jobId}/unassign-courier")
    public Mono<ResponseEntity<ApiResponse<Job>>> unassignCourier(@PathVariable String jobId) {
        return service.unassignCourier(jobId).map(ResponseEntity::ok);
    }

    @PutMapping("/{jobId}/pickup")
    public Mono<ResponseEntity<ApiResponse<Job>>> markAsPickedUp(@PathVariable String jobId) {
        return service.markAsPickedUp(jobId).map(ResponseEntity::ok);
    }

    @PutMapping("/{jobId}/in-transit")
    public Mono<ResponseEntity<ApiResponse<Job>>> markAsInTransit(@PathVariable String jobId) {
        return service.markAsInTransit(jobId).map(ResponseEntity::ok);
    }

    @PutMapping("/{jobId}/out-for-delivery")
    public Mono<ResponseEntity<ApiResponse<Job>>> markAsOutForDelivery(@PathVariable String jobId) {
        return service.markAsOutForDelivery(jobId).map(ResponseEntity::ok);
    }

    @PutMapping("/{jobId}/delivered")
    public Mono<ResponseEntity<ApiResponse<Job>>> markAsDelivered(@PathVariable String jobId) {
        return service.markAsDelivered(jobId).map(ResponseEntity::ok);
    }

    @PutMapping("/{jobId}/failed")
    public Mono<ResponseEntity<ApiResponse<Job>>> markAsFailed(@PathVariable String jobId) {
        return service.markAsFailed(jobId).map(ResponseEntity::ok);
    }

    @PutMapping("/{jobId}/cancelled")
    public Mono<ResponseEntity<ApiResponse<Job>>> markAsCancelled(@PathVariable String jobId) {
        return service.markAsCancelled(jobId).map(ResponseEntity::ok);
    }

    @PutMapping("/{jobId}/returned")
    public Mono<ResponseEntity<ApiResponse<Job>>> markAsReturned(@PathVariable String jobId) {
        return service.markAsReturned(jobId).map(ResponseEntity::ok);
    }
}



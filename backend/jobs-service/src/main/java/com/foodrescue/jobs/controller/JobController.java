package com.foodrescue.jobs.controller;

import com.foodrescue.jobs.web.response.RecentOrderDto;
import org.springframework.security.access.prepost.PreAuthorize;
import com.foodrescue.jobs.web.response.AdminOrderView;
import com.foodrescue.jobs.entity.OrderDocument;
import com.foodrescue.jobs.model.CourierStats;
import com.foodrescue.jobs.model.Job;
import com.foodrescue.jobs.service.JobService;
import com.foodrescue.jobs.service.CourierStatsService;
import com.foodrescue.jobs.web.response.AddressDto;
import com.foodrescue.jobs.web.response.ApiResponse;
import com.foodrescue.jobs.web.response.UserDto;
import com.foodrescue.jobs.web.response.UserNameDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import org.springframework.security.core.Authentication;

import java.time.Instant;

@RestController
@RequestMapping("/api/v1/jobs")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class JobController {

    private final JobService service;
    private final CourierStatsService courierStatsService;

    @GetMapping("/admin/recent-orders")
    @PreAuthorize("hasRole('ADMIN')")
    public Flux<RecentOrderDto> getRecentOrders(Mono<Authentication> authMono) {
        return service.getRecentOrders(authMono);
    }

    @GetMapping("/admin/orders-today-count")
    @PreAuthorize("hasRole('ADMIN')")
    public Mono<Long> getOrdersTodayCount() {
        // This returns the number directly (e.g., 127)
        return service.countOrdersToday();
    }

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
    public Mono<ResponseEntity<ApiResponse<UserDto>>> getOrderReceiver(
            @PathVariable String orderId,
            Mono<Authentication> authMono) { // <-- 1. ADD THIS

        return service.getReceiverForOrder(orderId, authMono).map(ResponseEntity::ok); // <-- 2. PASS IT
    }

    @GetMapping("/users/{userId}")
    public Mono<ResponseEntity<ApiResponse<UserNameDto>>> getUserById(
            @PathVariable String userId,
            Mono<Authentication> authMono) { // <-- 1. ADD THIS

        return service.getUserById(userId, authMono).map(ResponseEntity::ok); // <-- 2. PASS IT
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

    @GetMapping("/courier/{courierId}/stats")
    public Mono<ResponseEntity<ApiResponse<CourierStats>>> getCourierStats(@PathVariable String courierId) {
        return courierStatsService.getStats(courierId)
                .map(stats -> ResponseEntity.ok(ApiResponse.ok(stats)))
                .switchIfEmpty(Mono.just(ResponseEntity.ok(ApiResponse.ok(
                        CourierStats.builder()
                                .courierId(courierId)
                                .mealsDelivered(0)
                                .peopleHelped(0)
                                .totalRescues(0)
                                .impactScore(4.5)
                                .failedDeliveries(0)
                                .cancelledDeliveries(0)
                                .updatedAt(Instant.now())
                                .build()
                ))));
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

    @GetMapping("/admin/order-view")
    @PreAuthorize("hasRole('ADMIN')")
    public Flux<AdminOrderView> getAdminOrderView(Mono<Authentication> authMono) { 
        return service.getAdminOrderView(authMono);
    }
    @GetMapping("/by-order/{orderId}")
    public Mono<Job> singleJobByOrder(@PathVariable String orderId) {
        return service.getSingleJobByOrderId(orderId);
    }
}



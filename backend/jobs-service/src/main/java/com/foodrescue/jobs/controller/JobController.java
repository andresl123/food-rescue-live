package com.foodrescue.jobs.controller;

import com.foodrescue.jobs.model.Job;
import com.foodrescue.jobs.service.JobService;
import com.foodrescue.jobs.web.response.ApiResponse;
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

    @GetMapping("/{id}")
    public Mono<ResponseEntity<ApiResponse<Job>>> get(@PathVariable String id) {
        return service.getById(id).map(ResponseEntity::ok);
    }

    @GetMapping("/order/{orderId}")
    public Flux<Job> byOrder(@PathVariable String orderId) { return service.getByOrderId(orderId); }

    @GetMapping("/status1/{status1}")
    public Flux<Job> byStatus1(@PathVariable String status1) { return service.getByStatus1(status1); }

    @GetMapping("/status2/{status2}")
    public Flux<Job> byStatus2(@PathVariable String status2) { return service.getByStatus2(status2); }

    @GetMapping("/courier/{courierId}")
    public Flux<Job> byCourier(@PathVariable String courierId) { return service.getByCourierId(courierId); }

    @GetMapping("/courier/{courierId}/status1/{status1}")
    public Flux<Job> byCourierAndStatus1(@PathVariable String courierId, @PathVariable String status1) {
        return service.getByCourierIdAndStatus1(courierId, status1);
    }

    @GetMapping("/courier/{courierId}/status2/{status2}")
    public Flux<Job> byCourierAndStatus2(@PathVariable String courierId, @PathVariable String status2) {
        return service.getByCourierIdAndStatus2(courierId, status2);
    }

    @PutMapping("/{id}/status1")
    public Mono<ResponseEntity<ApiResponse<Job>>> updateStatus1(@PathVariable String id, @RequestParam String status1) {
        return service.updateStatus1(id, status1).map(ResponseEntity::ok);
    }

    @PutMapping("/{id}/status2")
    public Mono<ResponseEntity<ApiResponse<Job>>> updateStatus2(@PathVariable String id, @RequestParam String status2) {
        return service.updateStatus2(id, status2).map(ResponseEntity::ok);
    }

    @PutMapping("/{jobId}/assign-courier/{courierId}")
    public Mono<ResponseEntity<ApiResponse<Job>>> assignCourier(@PathVariable String jobId, @PathVariable String courierId) {
        return service.assignCourier(jobId, courierId).map(ResponseEntity::ok);
    }
}



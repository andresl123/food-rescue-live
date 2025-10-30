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

    @GetMapping("/{id}")
    public Mono<ResponseEntity<ApiResponse<Job>>> get(@PathVariable String id) {
        return service.getById(id).map(ResponseEntity::ok);
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

    @PutMapping("/{id}/status")
    public Mono<ResponseEntity<ApiResponse<Job>>> updateStatus(@PathVariable String id, @RequestParam String status) {
        return service.updateStatus(id, status).map(ResponseEntity::ok);
    }
}



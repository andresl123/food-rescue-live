package com.foodrescue.evidence.controller;

import com.foodrescue.evidence.service.JobService;
import com.foodrescue.evidence.web.request.JobCreateRequest;
import com.foodrescue.evidence.web.response.ApiResponse;
import com.foodrescue.evidence.web.response.JobResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import org.springframework.security.access.prepost.PreAuthorize;
import static com.foodrescue.security.contracts.RBAC.*;
import static com.foodrescue.security.contracts.RbacExpr.*;

@RestController
@RequestMapping("/api/v1/jobs")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class JobController {
    
    private final JobService jobService;
    
    @PostMapping
    public Mono<ResponseEntity<ApiResponse<JobResponse>>> create(@Valid @RequestBody JobCreateRequest request) {
        return jobService.create(request)
                .map(ResponseEntity::ok);
    }
    
    @GetMapping("/{id}")
    public Mono<ResponseEntity<ApiResponse<JobResponse>>> getById(@PathVariable String id) {
        return jobService.getById(id)
                .map(ResponseEntity::ok);
    }
    
    @GetMapping("/order/{orderId}/status/{status}")
    public Flux<JobResponse> getByOrderIdAndStatus(
            @PathVariable String orderId, 
            @PathVariable String status) {
        return jobService.getByOrderIdAndStatus(orderId, status);
    }
    
    @GetMapping("/courier/{courierId}")
    public Flux<JobResponse> getByCourierId(@PathVariable String courierId) {
        return jobService.getByCourierId(courierId);
    }
    
    @GetMapping("/order/{orderId}")
    public Flux<JobResponse> getByOrderId(@PathVariable String orderId) {
        return jobService.getByOrderId(orderId);
    }
    
    @GetMapping("/status/{status}")
    public Flux<JobResponse> getByStatus(@PathVariable String status) {
        return jobService.getByStatus(status);
    }
    
    @GetMapping("/courier/{courierId}/status/{status}")
    public Flux<JobResponse> getByCourierIdAndStatus(
            @PathVariable String courierId, 
            @PathVariable String status) {
        return jobService.getByCourierIdAndStatus(courierId, status);
    }
    
    @PutMapping("/{id}/status")
    public Mono<ResponseEntity<ApiResponse<JobResponse>>> updateStatus(
            @PathVariable String id, 
            @RequestParam String status) {
        return jobService.updateStatus(id, status)
                .map(ResponseEntity::ok);
    }
    
    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<ApiResponse<Void>>> delete(@PathVariable String id) {
        return jobService.delete(id)
                .map(ResponseEntity::ok);
    }

    @PreAuthorize(ADMIN)
    @GetMapping("/demoforadmin")
    public Mono<String> DemoAdminAccess(){
        return Mono.just("Only Admin can Access this");
    }

    @PreAuthorize(COURIER)
    @GetMapping("/demoforcourier")
    public Mono<String> DemoCourierAccess(){
        return Mono.just("Only Courier can Access this");
    }
}

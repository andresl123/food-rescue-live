package com.foodrescue.evidence.controller;

import com.foodrescue.evidence.service.PODService;
import com.foodrescue.evidence.web.request.PODCreateRequest;
import com.foodrescue.evidence.web.request.VerificationRequest;
import com.foodrescue.evidence.web.response.ApiResponse;
import com.foodrescue.evidence.web.response.PODResponse;
import com.foodrescue.evidence.web.response.VerificationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/pods")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PODController {
    
    private final PODService podService;
    
    @PostMapping
    public Mono<ResponseEntity<ApiResponse<PODResponse>>> create(@Valid @RequestBody PODCreateRequest request) {
        return podService.create(request)
                .map(ResponseEntity::ok);
    }
    
    @GetMapping("/{id}")
    public Mono<ResponseEntity<ApiResponse<PODResponse>>> getById(@PathVariable String id) {
        return podService.getById(id)
                .map(ResponseEntity::ok);
    }
    
    @GetMapping("/job/{jobId}")
    public Flux<PODResponse> getByJobId(@PathVariable String jobId) {
        return podService.getByJobId(jobId);
    }
    
    @PostMapping("/verify")
    public Mono<ResponseEntity<ApiResponse<VerificationResponse>>> verify(@Valid @RequestBody VerificationRequest request) {
        return podService.verify(request)
                .map(ResponseEntity::ok);
    }
    
    
    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<ApiResponse<Void>>> delete(@PathVariable String id) {
        return podService.delete(id)
                .map(ResponseEntity::ok);
    }
    
    @GetMapping("/test-collections")
    public Mono<ResponseEntity<String>> testCollections() {
        return Mono.just(ResponseEntity.ok("Collections will be created when you save data. Try creating an order, job, and POD first."));
    }
}

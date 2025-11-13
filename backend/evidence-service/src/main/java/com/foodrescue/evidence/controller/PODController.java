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
        return podService.create(request).map(ResponseEntity::ok);
    }

    @PostMapping("/generate-otp")
    public Mono<ResponseEntity<ApiResponse<PODResponse>>> generateOtps(@RequestParam String jobId) {
        return podService.generateOtps(jobId).map(ResponseEntity::ok);
    }

    @GetMapping("/latest/{jobId}")
    public Mono<ResponseEntity<ApiResponse<PODResponse>>> latestForJob(@PathVariable String jobId) {
        return podService.getLatestForJob(jobId).map(ResponseEntity::ok);
    }

    @GetMapping("/job/{jobId}")
    public Flux<PODResponse> historyForJob(@PathVariable String jobId) {
        return podService.getByJobId(jobId);
    }

    @GetMapping("/verify/{jobId}/{role}")
    public Mono<ResponseEntity<ApiResponse<VerificationResponse>>> verifyViaQuery(@PathVariable String jobId,
                                                                                  @PathVariable String role,
                                                                                  @RequestParam("code") String code) {
        return podService.verify(jobId, role, code).map(ResponseEntity::ok);
    }

    @PostMapping("/verify")
    public Mono<ResponseEntity<ApiResponse<VerificationResponse>>> verify(@Valid @RequestBody VerificationRequest request) {
        return podService.verify(request).map(ResponseEntity::ok);
    }

    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<ApiResponse<Void>>> delete(@PathVariable String id) {
        return podService.delete(id).map(ResponseEntity::ok);
    }

    @DeleteMapping("/job/{jobId}")
    public Mono<ResponseEntity<ApiResponse<Void>>> deleteForJob(@PathVariable String jobId) {
        return podService.deleteByJobId(jobId).map(ResponseEntity::ok);
    }
}

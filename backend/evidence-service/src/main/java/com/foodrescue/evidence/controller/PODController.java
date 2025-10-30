package com.foodrescue.evidence.controller;

import com.foodrescue.evidence.service.PODService;
import com.foodrescue.evidence.web.response.ApiResponse;
import com.foodrescue.evidence.web.response.PODResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/pods")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PODController {
    
    private final PODService podService;
    
    @PostMapping("/generate-otp")
    public Mono<ResponseEntity<ApiResponse<PODResponse>>> generateOtp(@RequestParam String jobId) {
        return podService.generateOtp(jobId).map(ResponseEntity::ok);
    }

    @GetMapping("/otp/{jobId}/donor")
    public Mono<ResponseEntity<ApiResponse<String>>> getDonorOtp(@PathVariable String jobId) {
        return podService.getDonorOtp(jobId).map(ResponseEntity::ok);
    }

    @GetMapping("/otp/{jobId}/receiver")
    public Mono<ResponseEntity<ApiResponse<String>>> getReceiverOtp(@PathVariable String jobId) {
        return podService.getReceiverOtp(jobId).map(ResponseEntity::ok);
    }

    // Verification endpoints (GET only for easy browser testing)
    @GetMapping("/verify/{jobId}/donor")
    public Mono<ResponseEntity<Boolean>> verifyDonorGet(@PathVariable String jobId, @RequestParam String code) {
        return podService.verifyDonorOtp(jobId, code).map(ResponseEntity::ok);
    }

    @GetMapping("/verify/{jobId}/receiver")
    public Mono<ResponseEntity<Boolean>> verifyReceiverGet(@PathVariable String jobId, @RequestParam String code) {
        return podService.verifyReceiverOtp(jobId, code).map(ResponseEntity::ok);
    }
}

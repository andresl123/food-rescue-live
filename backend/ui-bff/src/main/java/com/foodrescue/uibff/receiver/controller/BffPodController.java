package com.foodrescue.uibff.receiver.controller;

import com.foodrescue.uibff.receiver.service.BffPodService;
import com.foodrescue.uibff.web.response.ApiResponse;
import com.foodrescue.uibff.web.response.PODResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/pods") // This is the public path (no /v1/)
@RequiredArgsConstructor
public class BffPodController {

    private final BffPodService bffPodService;

    /**
     * Endpoint for fetching the latest POD for a job.
     * This is called by Postman (or your frontend).
     */
    @GetMapping("/latest/{jobId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DONOR', 'RECIPIENT', 'COURIER')") // Or just ADMIN
    public Mono<ResponseEntity<ApiResponse<PODResponse>>> getLatestForJob(
            @PathVariable String jobId,
            Mono<Authentication> authMono) {

        return bffPodService.getLatestForJob(jobId, authMono)
                .map(ResponseEntity::ok);
    }
}
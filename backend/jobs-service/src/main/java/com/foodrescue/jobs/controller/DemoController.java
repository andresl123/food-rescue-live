package com.foodrescue.jobs.controller;

import com.foodrescue.security.contracts.RBAC;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/jobs")
public class DemoController {

    // Open health/ping example (optional) — if you keep default chain, this still requires auth.
    @GetMapping("/ping")
    public Mono<String> ping() {
        return Mono.just("jobs-service is alive");
    }

    @PreAuthorize(RBAC.ADMIN)
    @GetMapping("/demoforadmin")
    public Mono<String> demoAdmin() {
        return Mono.just("Only Admin can access this");
    }

    @PreAuthorize(RBAC.COURIER)
    @GetMapping("/demoforcourier")
    public Mono<String> demoCourier() {
        return Mono.just("Only Courier can access this");
    }

    @PreAuthorize(RBAC.DONOR)
    @GetMapping("/demofordonor")
    public Mono<String> demoDonor() {
        return Mono.just("Only Donor can access this");
    }

    @PreAuthorize(RBAC.RECEIVER)
    @GetMapping("/demoforreceiver")
    public Mono<String> demoReceiver() {
        return Mono.just("Only Receiver can access this");
    }

    // Example: union
    @PreAuthorize(RBAC.COURIER_OR_ADMIN)
    @GetMapping("/demoforcourieroradmin")
    public Mono<String> demoCourierOrAdmin() {
        return Mono.just("Courier or Admin can access this");
    }
}


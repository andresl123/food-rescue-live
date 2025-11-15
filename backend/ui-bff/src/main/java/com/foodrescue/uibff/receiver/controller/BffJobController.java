package com.foodrescue.uibff.receiver.controller;

import com.foodrescue.uibff.receiver.service.BffJobService;
import com.foodrescue.uibff.web.response.RecentOrderDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.foodrescue.uibff.web.response.AdminOrderView;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/jobs") // This matches your frontend's call
@RequiredArgsConstructor
public class BffJobController {

    private final BffJobService bffJobService;

    @GetMapping("/admin/recent-orders")
    @PreAuthorize("hasRole('ADMIN')")
    public Flux<RecentOrderDto> getRecentOrders(Mono<Authentication> authMono) { // <-- 3. ADD authMono
        return bffJobService.getRecentOrders(authMono); // <-- 4. PASS authMono
    }
    @GetMapping("/admin/orders-today-count")
    @PreAuthorize("hasRole('ADMIN')")
    public Mono<Long> getOrdersTodayCount(Mono<Authentication> authMono) {
        return bffJobService.getOrdersTodayCount(authMono);
    }
    @GetMapping("/admin/order-view")
    @PreAuthorize("hasRole('ADMIN')")
    public Flux<AdminOrderView> getAdminOrderView(Mono<Authentication> authMono) {
        return bffJobService.getAdminOrderView(authMono);
    }
}
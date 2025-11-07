package com.foodrescue.uibff.receiver.service;

import com.foodrescue.uibff.receiver.dto.*; // Assuming this imports LotData, ItemData, AddressResponse, etc.
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders; // Required for Authorization header
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils; // Required for checking if the header is present
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final WebClient webClient;

    // Inject base URLs from application.properties
    @Value("${services.lots.base-url}")
    private String lotsBaseUrl;

    @Value("${services.auth.base-url}")
    private String authBaseUrl;

    public DashboardService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    /**
     * Main orchestration method.
     * Gets the aggregated dashboard data for the UI, forwarding the Authorization header.
     * * @param authHeader The Authorization header (e.g., "Bearer <token>") passed from the controller.
     */
    public Mono<List<DashboardLot>> getAggregatedDashboard(int page, int size, String authHeader) {

        // 1. Fetch the main list of lots (from Image 3)
        return webClient.get()
                .uri(lotsBaseUrl + "/api/v1/lots/dashboard?page={page}&size={size}", page, size)
                .headers(headers -> { // Add Authorization header to the request for the Lot List
                    if (StringUtils.hasText(authHeader)) {
                        headers.set(HttpHeaders.AUTHORIZATION, authHeader);
                    }
                })
                .retrieve()
                .bodyToMono(LotListResponse.class)
                .map(LotListResponse::getData)
                .flatMapMany(Flux::fromIterable)
                // Pass the header down to the next method for parallel calls
                .flatMap(lot -> fetchDetailsAndAggregate(lot, authHeader))
                .collectList();
    }

    /**
     * For a single Lot, fetches its items and address in parallel, forwarding the Authorization header.
     */
    private Mono<DashboardLot> fetchDetailsAndAggregate(LotData lot, String authHeader) {

        // 1. Define the call to fetch items (from Image 5)
        Mono<List<ItemData>> itemsMono = webClient.get()
                .uri(lotsBaseUrl + "/api/v1/lots/{lotId}/items", lot.getLotId())
                .headers(headers -> { // Add Authorization header to the request for Items
                    if (StringUtils.hasText(authHeader)) {
                        headers.set(HttpHeaders.AUTHORIZATION, authHeader);
                    }
                })
                .retrieve()
                .bodyToFlux(ItemData.class)
                .collectList()
                .onErrorReturn(List.of());

        // 2. Define the call to fetch the address (from Image 4)
        Mono<AddressResponse> addressMono = webClient.get()
                .uri(authBaseUrl + "/api/v1/addresses/{id}", lot.getAddressId())
                .headers(headers -> { // Add Authorization header to the request for Address
                    if (StringUtils.hasText(authHeader)) {
                        headers.set(HttpHeaders.AUTHORIZATION, authHeader);
                    }
                })
                .retrieve()
                .bodyToMono(AddressResponse.class)
                .onErrorReturn(new AddressResponse());

        // 3. Execute both calls in parallel and map the result
        return Mono.zip(itemsMono, addressMono)
                .map(tuple -> {
                    List<ItemData> items = tuple.getT1();
                    AddressData address = tuple.getT2().getData();
                    return buildDashboardLot(lot, items, address);
                });
    }

    /**
     * Helper method to transform all the downstream data into the final UI DTO. (No change needed here)
     */
    private DashboardLot buildDashboardLot(LotData lot, List<ItemData> items, AddressData address) {

        // --- Calculate derived fields as requested ---
        List<String> itemNames = items.stream()
                .map(ItemData::getItemName)
                .collect(Collectors.toList());

        int totalItems = itemNames.size();

        String locationName = "Unknown Location";
        if (address != null && address.getStreet() != null && address.getCity() != null) {
            //locationName = address.getStreet() + ", " + address.getCity();
            locationName = address.getStreet() ;
        }

        String earliestExpiry = items.stream()
                .map(item -> LocalDate.parse(item.getExpiryDate()))
                .min(LocalDate::compareTo)
                .orElse(LocalDate.now().plusDays(1))
                .atStartOfDay(ZoneOffset.UTC)
                .toString();

        // --- Build the final DTO ---
        return DashboardLot.builder()
                .id(lot.getLotId())
                .title(lot.getDescription())
                .category(lot.getCategory())
                .description(lot.getDescription())
                .items(itemNames)
                .totalItems(totalItems)
                .tags(lot.getTags())
                .pickupWindow("Today 3–6pm") // Static
                .locationName(locationName)
                .distanceKm(2) // Static
                .expiresAt(earliestExpiry)
                .imageUrl(lot.getImageUrl())
                .build();
    }
}
package com.foodrescue.auth.controller;

import com.foodrescue.auth.entity.Address;
import com.foodrescue.auth.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/addresses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AddressController {

    private final AddressRepository addressRepository;

    // ✅ Create address
    @PostMapping
    public Mono<Map<String, Object>> createAddress(@RequestBody Address address) {
        return addressRepository.save(address)
                .map(saved -> Map.of(
                        "success", true,
                        "data", saved
                ));
    }

    // ✅ Get all addresses
    @GetMapping
    public Flux<Address> getAllAddresses() {
        return addressRepository.findAll();
    }

    // ✅ Get address by ID
    @GetMapping("/{id}")
    public Mono<Map<String, Object>> getAddressById(@PathVariable String id) {
        return addressRepository.findById(id)
                .map(found -> Map.of(
                        "success", true,
                        "data", found
                ))
                .switchIfEmpty(Mono.just(Map.of(
                        "success", false,
                        "message", "Address not found"
                )));
    }
}

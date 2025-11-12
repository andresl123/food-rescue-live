package com.foodrescue.auth.controller;

import com.foodrescue.auth.entity.Address;
import com.foodrescue.auth.repository.AddressRepository;
import com.foodrescue.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/addresses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AddressController {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

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

    // ✅ NEW: Get all addresses for a specific user (using moreAddresses list)
    @GetMapping("/user/{userId}")
    public Flux<Address> getAddressesForUser(@PathVariable String userId) {
        return userRepository.findById(userId)
                .flatMapMany(user -> {
                    List<String> ids = user.getMoreAddresses();
                    ids.add(user.getDefaultAddressId());
                    if (ids == null || ids.isEmpty()) {
                        return Flux.empty();
                    }
                    return addressRepository.findAllById(ids);
                });
    }

    // ✅ Update address by ID
    @PutMapping("/{id}")
    public Mono<Map<String, Object>> updateAddress(@PathVariable String id, @RequestBody Address updatedAddress) {
        return addressRepository.findById(id)
                .flatMap(existing -> {
                    existing.setStreet(updatedAddress.getStreet());
                    existing.setCity(updatedAddress.getCity());
                    existing.setState(updatedAddress.getState());
                    existing.setPostalCode(updatedAddress.getPostalCode());
                    existing.setCountry(updatedAddress.getCountry());
                    return addressRepository.save(existing);
                })
                .map(saved -> Map.of(
                        "success", true,
                        "data", saved
                ))
                .switchIfEmpty(Mono.just(Map.of(
                        "success", false,
                        "message", "Address not found"
                )));
    }

}

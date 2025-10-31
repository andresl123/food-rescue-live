package com.foodrescue.auth.service;

import com.foodrescue.auth.entity.Address;
import com.foodrescue.auth.repository.AddressRepository;
import com.foodrescue.auth.repository.UserRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressService(AddressRepository addressRepository, UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    public Flux<Address> getAddressesByUserId(String userId) {
        return userRepository.findById(userId)
                .flatMapMany(user -> {
                    if (user.getMoreAddresses() == null || user.getMoreAddresses().isEmpty()) {
                        return Flux.empty();
                    }
                    // ✅ this uses the built-in ReactiveMongoRepository method
                    return addressRepository.findAllById(user.getMoreAddresses());
                });
    }
}

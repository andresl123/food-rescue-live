package com.foodrescue.auth.controller;


import com.foodrescue.auth.service.UserService;
import com.foodrescue.auth.web.request.UserCreateRequest;
import com.foodrescue.auth.web.request.UserUpdateRequest;
import com.foodrescue.auth.web.response.ApiResponse;
import com.foodrescue.auth.web.response.UserResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import com.foodrescue.auth.service.VerificationService;
import com.foodrescue.auth.repository.UserRepository;
import com.foodrescue.auth.web.response.AddressesResponse;



@CrossOrigin(
        origins = "http://localhost:5173",
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PATCH, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}
)

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService service;
    private final VerificationService verificationService;
    private final UserRepository userRepository;

//    public UserController(UserService service) { this.service = service; }
public UserController(UserService service,
                      VerificationService verificationService,
                      UserRepository userRepository) {
    this.service = service;
    this.verificationService = verificationService;
    this.userRepository = userRepository;
}


    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ApiResponse<UserResponse>> create(@Valid @RequestBody UserCreateRequest req) {
        return service.create(req).map(ApiResponse::created);
    }

    @GetMapping("/{id}")
    public Mono<ApiResponse<UserResponse>> get(@PathVariable String id) {
        return service.get(id).map(ApiResponse::ok);
    }

    @PatchMapping("/{id}/addresses")
    @ResponseStatus(HttpStatus.OK)
    public Mono<ApiResponse<UserResponse>> addAddressToUser(
            @PathVariable String id,
            @RequestBody Map<String, Object> body
    ) {
        // ✅ Debug log — add this line
        System.out.println("➡️ PATCH /users/" + id + "/addresses called with body: " + body);

        String addressId = (String) body.get("addressId");
        boolean setAsDefault = body.get("setAsDefault") != null && (boolean) body.get("setAsDefault");

        return service.addAddressToUser(id, addressId, setAsDefault)
                .map(ApiResponse::ok);
    }

    @GetMapping("/{id}/default-address")
    public Mono<Map<String, Object>> getDefaultAddressId(@PathVariable String id) {
        return service.getDefaultAddressId(id)
                .map(addrId -> {
                    Map<String, Object> resp = new java.util.HashMap<>();
                    resp.put("success", true);
                    resp.put("defaultAddressId", addrId);
                    return resp;
                })
                .onErrorResume(ex -> {
                    Map<String, Object> err = new java.util.HashMap<>();
                    err.put("success", false);
                    err.put("message", ex.getMessage());
                    return Mono.just(err);
                });
    }
    // Get All Users
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Mono<ApiResponse<List<UserResponse>>> getAllUsers() {
        // We use .collectList() to turn the Flux<User> into a Mono<List<User>>
        // Then we use .map() to wrap that List in our ApiResponse
        return service.getAllUsers()
                .collectList()
                .map(ApiResponse::ok);
    }
    // Update User
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Mono<ApiResponse<UserResponse>> updateUser(
            @PathVariable String id,
            @Valid @RequestBody UserUpdateRequest req) {
        return service.updateUser(id, req).map(ApiResponse::ok);
    }
    // Delete User
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Mono<ApiResponse<Void>> deleteUser(@PathVariable String id) {
        return service.deleteUser(id).then(Mono.just(ApiResponse.noContent()));
    }

    @PutMapping("/{userId}/update-email")
    public Mono<ResponseEntity<Map<String, String>>> updateEmail(
            @PathVariable String userId,
            @RequestBody Map<String, String> body) {

        String newEmail = body.get("email");

        if (!verificationService.isVerified(newEmail)) {
            return Mono.just(ResponseEntity.badRequest()
                    .body(Map.of("message", "Please verify this email first.")));
        }

        return userRepository.findById(userId)
                .flatMap(user -> {
                    user.setEmail(newEmail);
                    return userRepository.save(user)
                            .thenReturn(ResponseEntity.ok(Map.of("message", "Email updated successfully.")));
                })
                .switchIfEmpty(Mono.just(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "User not found."))));
    }

    @PutMapping("/{userId}/update-phone")
    public Mono<ResponseEntity<Map<String, Object>>> updatePhone(
            @PathVariable String userId,
            @RequestBody Map<String, String> body) {

        String newPhone = body.get("phone");

        return userRepository.findById(userId)
                .flatMap(user -> {
                    // ✅ Check if OTP sent to user's registered email was verified
                    if (!verificationService.isVerified(user.getEmail())) {
                        return Mono.just(ResponseEntity.badRequest()
                                .body(Map.<String, Object>of("message", "Please verify OTP sent to your registered email first.")));
                    }

                    // ✅ Save the new phone number after successful email OTP verification
                    user.setPhoneNumber(newPhone);
                    return userRepository.save(user)
                            .thenReturn(ResponseEntity.ok(Map.<String, Object>of("message", "Phone number updated successfully.")));
                })
                .switchIfEmpty(Mono.just(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.<String, Object>of("message", "User not found."))));
    }








}



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

    public UserController(UserService service) { this.service = service; }

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
}



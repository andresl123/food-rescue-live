package com.foodrescue.auth.controller;


import com.foodrescue.auth.service.UserService;
import com.foodrescue.auth.web.request.UserCreateRequest;
import com.foodrescue.auth.web.response.ApiResponse;
import com.foodrescue.auth.web.response.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
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


}



package com.foodrescue.jobs.web.response;

import java.time.Instant;
import java.util.Set;
import lombok.Data;

@Data
public class UserDto {
    private String id;
    private String name;
    private String email;
    private String categoryId;
    private String phoneNumber;
    private String defaultAddressId;
    private Set<String> roles;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;
}


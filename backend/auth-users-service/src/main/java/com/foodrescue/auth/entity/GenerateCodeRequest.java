// src/main/java/com/example/codeverification/dto/GenerateCodeRequest.java
package com.foodrescue.auth.entity;

import lombok.Data;

@Data
public class GenerateCodeRequest {
    private String identifier; // e.g., email, username, or phone number
}
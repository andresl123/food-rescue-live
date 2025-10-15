// src/main/java/com/example/codeverification/dto/ValidateCodeRequest.java
package com.foodrescue.auth.entity;

import lombok.Data;

@Data
public class ValidateCodeRequest {
    private String identifier;
    private String code;
}
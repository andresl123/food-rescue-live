package com.foodrescue.lots.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LotCreateRequest {

    @NotBlank(message = "Description cannot be blank.")
    private String description;

    private String imageUrl;

    private String addressId;

}

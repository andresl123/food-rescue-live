package com.foodrescue.lots.dto;

import lombok.Data;

@Data
public class LotUpdateRequest {

    private String description;
    private String status;
    private String imageUrl; // ✅ allow updates to image

}

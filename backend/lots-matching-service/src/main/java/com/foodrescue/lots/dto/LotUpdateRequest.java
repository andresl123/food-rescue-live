package com.foodrescue.lots.dto;

import com.foodrescue.lots.entity.Category;
import com.foodrescue.lots.entity.Tag;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class LotUpdateRequest {

    private String description;
    private String status;
    private String imageUrl;

    private Category category;

    @Size(max = 3, message = "At most 3 tags are allowed.")
    private List<Tag> tags;
}

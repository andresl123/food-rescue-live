package com.foodrescue.lots.dto;

import com.foodrescue.lots.entity.Category;
import com.foodrescue.lots.entity.Tag;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class LotCreateRequest {

    @NotBlank(message = "Description cannot be blank.")
    private String description;

    private String imageUrl;

    private String addressId;

    /** Optional: defaults to OTHER in service if null */
    private Category category;

    /** Optional tags list */
    @Size(max = 3, message = "At most 3 tags are allowed.")
    private List<Tag> tags;
}

package com.foodrescue.auth.entity;

import com.foodrescue.auth.entity.base.Auditable;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("users")
public class User extends Auditable {

    @Id
    private String id;

    @NotBlank
    @Size(max = 120)
    private String name;

    @Email
    @NotBlank
    @Indexed(unique = true)
    private String email;

    @NotBlank
    private String password;

    @NotBlank
    private String categoryId;

    @Indexed(unique = true, sparse = true)
    private String phoneNumber;

    private String defaultAddressId;

    @Builder.Default
    private List<String> moreAddresses = List.of();

    @Builder.Default
    private Set<String> roles = Set.of("USER");

    @Builder.Default
    private String status = "ACTIVE";
}

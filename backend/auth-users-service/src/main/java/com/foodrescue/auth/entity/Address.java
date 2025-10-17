package com.foodrescue.auth.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("addresses")
public class Address {
    @Id
    private String id;

    private String street;
    private String city;
    private String state;
    private String postalCode;
    private String country;
}

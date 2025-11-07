package com.foodrescue.jobs.web.response;

import lombok.Data;

@Data
public class AddressDto {
    private String id;
    private String street;
    private String city;
    private String state;
    private String postalCode;
    private String country;
}


package com.foodrescue.uibff.receiver.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * Represents the nested 'data' object in the address response.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AddressData {
    private String id;
    private String street;
    private String city;
    private String state;
    private String postalCode;
    private String country;
}

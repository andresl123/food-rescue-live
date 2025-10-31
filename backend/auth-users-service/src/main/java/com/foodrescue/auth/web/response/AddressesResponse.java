package com.foodrescue.auth.web.response;

import com.foodrescue.auth.entity.Address;
import java.util.List;

/**
 * Response object that returns both default and other addresses for a user.
 */
public class AddressesResponse {

    private Address defaultAddress;
    private List<Address> otherAddresses;

    public AddressesResponse(Address defaultAddress, List<Address> otherAddresses) {
        this.defaultAddress = defaultAddress;
        this.otherAddresses = otherAddresses;
    }

    public Address getDefaultAddress() {
        return defaultAddress;
    }

    public void setDefaultAddress(Address defaultAddress) {
        this.defaultAddress = defaultAddress;
    }

    public List<Address> getOtherAddresses() {
        return otherAddresses;
    }

    public void setOtherAddresses(List<Address> otherAddresses) {
        this.otherAddresses = otherAddresses;
    }
}

package com.foodrescue.uibff.receiver.dto.orders;

import java.util.List;

public record UiOrder(
        String id,
        String date,
        String status,
        UiParty donor,
        UiParty recipient,
        List<UiItem> items,
        UiCourier courier,
        String lotId
) {}

package com.foodrescue.uibff.receiver.dto.orders;

import java.util.List;

public record UiOrdersPayload(
        List<UiOrder> current,
        List<UiOrder> completed
) {}

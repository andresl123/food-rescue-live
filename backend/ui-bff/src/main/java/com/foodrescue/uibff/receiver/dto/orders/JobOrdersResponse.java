package com.foodrescue.uibff.receiver.dto.orders;

import java.util.List;

public record JobOrdersResponse(
        List<JobOrderRow> current,
        List<JobOrderRow> completed
) {}

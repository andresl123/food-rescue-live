package com.foodrescue.uibff.web.response;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(boolean success, T data, String message) {

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, null);
    }

    public static <T> ApiResponse<T> created(T data) {
        return new ApiResponse<>(true, data, null);
    }

    public static <T> ApiResponse<T> error(String msg) {
        return new ApiResponse<>(false, null, msg);
    }

    public static ApiResponse<Void> noContent() {
        return new ApiResponse<>(true, null, null);
    }
}
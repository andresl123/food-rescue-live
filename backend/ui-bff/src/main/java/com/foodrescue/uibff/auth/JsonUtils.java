package com.foodrescue.uibff.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public final class JsonUtils {
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private JsonUtils() {}

    public static String readString(String json, String path) {
        try {
            JsonNode n = MAPPER.readTree(json);
            for (String p : path.split("\\.")) n = n.path(p);
            return n.isMissingNode() || n.isNull() ? null : n.asText(null);
        } catch (Exception e) {
            return null;
        }
    }

    public static Long readLong(String json, String path) {
        try {
            JsonNode n = MAPPER.readTree(json);
            for (String p : path.split("\\.")) n = n.path(p);
            return n.isMissingNode() || n.isNull() ? null : n.asLong();
        } catch (Exception e) {
            return null;
        }
    }

    public static Boolean readBoolean(String json, String path) {
        try {
            JsonNode n = MAPPER.readTree(json);
            for (String p : path.split("\\.")) n = n.path(p);
            return n.isMissingNode() || n.isNull() ? null : n.asBoolean();
        } catch (Exception e) {
            return null;
        }
    }
}

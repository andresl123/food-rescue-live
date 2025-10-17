package com.foodrescue.auth.entity;

public interface RBAC {

    // --- Base / generic ---
    String AUTHENTICATED = "isAuthenticated()";
    String ADMIN         = "hasRole('ADMIN')";
    String USER          = "hasRole('USER')";
    String DONOR         = "hasRole('DONOR')";
    String RECEIVER      = "hasRole('RECEIVER')";
    String COURIER       = "hasRole('COURIER')";

    // Any role we recognize (useful for “logged-in actor” routes)
    String ANY_ACTOR     = "hasAnyRole('ADMIN','USER','DONOR','RECEIVER','COURIER')";

    // --- Unions (X or ADMIN) ---
    String DONOR_OR_ADMIN    = "hasAnyRole('DONOR','ADMIN')";
    String RECEIVER_OR_ADMIN = "hasAnyRole('RECEIVER','ADMIN')";
    String COURIER_OR_ADMIN  = "hasAnyRole('COURIER','ADMIN')";
    String USER_OR_ADMIN     = "hasAnyRole('USER','ADMIN')";

    // Combinations you may need for cross-role features
    String DONOR_OR_RECEIVER         = "hasAnyRole('DONOR','RECEIVER')";
    String DONOR_OR_RECEIVER_OR_ADMIN= "hasAnyRole('DONOR','RECEIVER','ADMIN')";
    String COURIER_OR_RECEIVER       = "hasAnyRole('COURIER','RECEIVER')";
    String COURIER_OR_RECEIVER_OR_ADMIN = "hasAnyRole('COURIER','RECEIVER','ADMIN')";
    String DONOR_OR_COURIER          = "hasAnyRole('DONOR','COURIER')";
    String DONOR_OR_COURIER_OR_ADMIN = "hasAnyRole('DONOR','COURIER','ADMIN')";

    // --- “Self or Admin” helpers (match the param name you use) ---
    // e.g., GET /users/{id}
    String SELF_OR_ADMIN_BY_ID        = "hasRole('ADMIN') or #id == authentication.name";
    // e.g., GET /users/{userId}
    String SELF_OR_ADMIN_BY_USER_ID   = "hasRole('ADMIN') or #userId == authentication.name";
    // e.g., GET /profiles?uid=...
    String SELF_OR_ADMIN_BY_UID       = "hasRole('ADMIN') or #uid == authentication.name";
    // e.g., some endpoints pass the subject explicitly in body/query
    String SELF_OR_ADMIN_BY_SUBJECT   = "hasRole('ADMIN') or #subject == authentication.name";

    // If you expose email as identifier (only if safe in your design)
    // Requires you to pass email as a method param and ensure JWT has email in claims if needed.
    String SELF_OR_ADMIN_BY_EMAIL     = "hasRole('ADMIN') or #email == principal.getClaim('email')";

    // --- Ownership checks via bean (recommended for resources) ---
    // Define a bean: @Component("ownership") with methods like:
    //   boolean isOwner(String resourceId, String userId)
    //   boolean canViewDonation(String donationId, String userId)
    // Then use these expressions:
    String OWNER_OR_ADMIN_BY_RESOURCE =
            "@ownership.isOwner(#resourceId, authentication.name) or hasRole('ADMIN')";

    String DONATION_OWNER_OR_ADMIN =
            "@ownership.canViewDonation(#donationId, authentication.name) or hasRole('ADMIN')";

    String PICKUP_OWNER_OR_ADMIN =
            "@ownership.canViewPickup(#pickupId, authentication.name) or hasRole('ADMIN')";

    // --- Domain action aliases (readable intent) ---
    // Admin scope
    String CAN_LIST_USERS        = ADMIN;
    String CAN_UPDATE_USER       = ADMIN; // or SELF_OR_ADMIN_BY_ID if you allow self-updates

    // Donations
    String CAN_CREATE_DONATION   = DONOR_OR_ADMIN;
    String CAN_VIEW_DONATION     = DONATION_OWNER_OR_ADMIN; // or DONOR_OR_ADMIN for all donor donations
    String CAN_LIST_DONATIONS    = DONOR_OR_ADMIN; // widen if receivers should list available ones

    // Pickups
    String CAN_ACCEPT_PICKUP     = COURIER_OR_ADMIN;
    String CAN_VIEW_PICKUP       = PICKUP_OWNER_OR_ADMIN;

    // Receiver operations
    String CAN_REQUEST_RECEIVE   = RECEIVER_OR_ADMIN;

    // Generic profile
    String CAN_VIEW_SELF_PROFILE = SELF_OR_ADMIN_BY_ID;
    String CAN_EDIT_SELF_PROFILE = SELF_OR_ADMIN_BY_ID;
}

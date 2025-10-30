package com.foodrescue.auth.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DemoController {

    @GetMapping("/demoendpoint")
    public String demoEndpoint() {
        return "In the Demo Endpoint";
    }
}


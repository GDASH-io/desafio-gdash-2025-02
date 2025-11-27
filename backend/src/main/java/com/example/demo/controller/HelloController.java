package com.example.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.demo.model.Message;

@RestController
public class HelloController {

    @GetMapping("/api/hello")
    public Message hello() {
        return new Message("Olá do backend Spring Boot!");
    }
}

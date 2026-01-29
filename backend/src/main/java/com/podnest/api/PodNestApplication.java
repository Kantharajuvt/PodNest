package com.podnest.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.data.jpa.repository.config.EnableJpaRepositories("com.podnest.api.repository")
@org.springframework.boot.autoconfigure.domain.EntityScan("com.podnest.api.model")
public class PodNestApplication {
    public static void main(String[] args) {
        SpringApplication.run(PodNestApplication.class, args);
    }
}

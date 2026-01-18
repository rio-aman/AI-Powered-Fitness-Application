package com.fitness.activityservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing

public class ActivityServiceMongoApplication {

	public static void main(String[] args) {
		SpringApplication.run(ActivityServiceMongoApplication.class, args);
	}

}
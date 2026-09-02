
package com.example.demo.controller;

import java.util.List;
import org.springframework.web.bind.annotation.*;
import com.example.demo.entity.Subscription;
import com.example.demo.service.SubscriptionService;

@RestController
@RequestMapping("/api/subscriptions")
@CrossOrigin(origins = "*")
public class SubscriptionController {

    private final SubscriptionService service;

    public SubscriptionController(SubscriptionService service) { this.service = service; }

    @GetMapping
    public List<Subscription> getAllSubscriptions(@RequestHeader("X-User-Email") String userEmail) {
        return service.getAllSubscriptions(userEmail);
    }

    @GetMapping("/{id}")
    public Subscription getSubscriptionById(@PathVariable Long id,
                                            @RequestHeader("X-User-Email") String userEmail) {
        return service.getSubscriptionById(id, userEmail);
    }

    @PostMapping
    public Subscription createSubscription(@RequestHeader("X-User-Email") String userEmail,
                                           @RequestBody Subscription subscription) {
        return service.createSubscription(subscription, userEmail);
    }

    @PutMapping("/{id}")
    public Subscription updateSubscription(@PathVariable Long id,
                                           @RequestHeader("X-User-Email") String userEmail,
                                           @RequestBody Subscription subscription) {
        return service.updateSubscription(id, subscription, userEmail);
    }

    @DeleteMapping("/{id}")
    public String deleteSubscription(@PathVariable Long id,
                                     @RequestHeader("X-User-Email") String userEmail) {
        service.deleteSubscription(id, userEmail);
        return "Subscription deleted successfully";
    }
}

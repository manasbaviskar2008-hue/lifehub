
package com.example.demo.service;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.example.demo.entity.Subscription;
import com.example.demo.repository.SubscriptionRepository;

@Service
public class SubscriptionService {

    private final SubscriptionRepository repository;
    private final UserOwnershipService ownershipService;

    public SubscriptionService(SubscriptionRepository repository, UserOwnershipService ownershipService) {
        this.repository = repository;
        this.ownershipService = ownershipService;
    }

    public List<Subscription> getAllSubscriptions(String userEmail) {
        Long userId = ownershipService.requireUser(userEmail).getId();
        return repository.findByUser_Id(userId);
    }

    public Subscription getSubscriptionById(Long id, String userEmail) {
        Long userId = ownershipService.requireUser(userEmail).getId();
        return repository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription not found"));
    }

    public Subscription createSubscription(Subscription subscription, String userEmail) {
        subscription.setUser(ownershipService.requireUser(userEmail));
        return repository.save(subscription);
    }

    public Subscription updateSubscription(Long id, Subscription incoming, String userEmail) {
        Long userId = ownershipService.requireUser(userEmail).getId();
        Subscription existing = repository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied"));

        existing.setName(incoming.getName());
        existing.setCategory(incoming.getCategory());
        existing.setPrice(incoming.getPrice());
        existing.setBillingCycle(incoming.getBillingCycle());
        existing.setNextBillingDate(incoming.getNextBillingDate());
        existing.setStatus(incoming.getStatus());
        existing.setNotes(incoming.getNotes());
        return repository.save(existing);
    }

    public void deleteSubscription(Long id, String userEmail) {
        Long userId = ownershipService.requireUser(userEmail).getId();
        Subscription existing = repository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied"));
        repository.delete(existing);
    }
}

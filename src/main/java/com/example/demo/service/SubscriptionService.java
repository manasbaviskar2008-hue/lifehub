package com.example.demo.service;

import com.example.demo.entity.Subscription;
import com.example.demo.repository.SubscriptionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;

    public SubscriptionService(SubscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }

    public List<Subscription> getAllSubscriptions() {
        return subscriptionRepository.findAll();
    }

    public Subscription getSubscriptionById(Long id) {
        return subscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));
    }

    public Subscription createSubscription(Subscription subscription) {
        return subscriptionRepository.save(subscription);
    }

    public Subscription updateSubscription(Long id, Subscription subscription) {

        Subscription existing = subscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));

        existing.setName(subscription.getName());
        existing.setCategory(subscription.getCategory());
        existing.setPrice(subscription.getPrice());
        existing.setBillingCycle(subscription.getBillingCycle());
        existing.setNextBillingDate(subscription.getNextBillingDate());
        existing.setStatus(subscription.getStatus());
        existing.setNotes(subscription.getNotes());

        return subscriptionRepository.save(existing);
    }

    public void deleteSubscription(Long id) {
        subscriptionRepository.deleteById(id);
    }
}
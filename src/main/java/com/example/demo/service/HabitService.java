package com.example.demo.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.entity.Habit;
import com.example.demo.repository.HabitRepository;

@Service
public class HabitService {

    private final HabitRepository repository;
    private final UserOwnershipService ownershipService;

    public HabitService(
            HabitRepository repository,
            UserOwnershipService ownershipService) {

        this.repository = repository;
        this.ownershipService = ownershipService;
    }

    // ===============================
    // GET ALL HABITS
    // ===============================
    public List<Habit> getAllHabits(String userEmail) {

        Long userId =
                ownershipService.requireUser(userEmail).getId();

        return repository.findByUser_Id(userId);
    }

    // ===============================
    // GET HABIT BY ID
    // ===============================
    public Habit getHabitById(
            Long id,
            String userEmail) {

        Long userId =
                ownershipService.requireUser(userEmail).getId();

        return repository.findByIdAndUser_Id(id, userId)
                .orElse(null);
    }

    // ===============================
    // CREATE HABIT
    // ===============================
    public Habit createHabit(
            Habit habit,
            String userEmail) {

        habit.setUser(
                ownershipService.requireUser(userEmail)
        );

        return repository.save(habit);
    }

    // ===============================
    // UPDATE HABIT
    // ===============================
    public Habit updateHabit(
            Long id,
            Habit incoming,
            String userEmail) {

        Long userId =
                ownershipService.requireUser(userEmail).getId();

        Habit existing =
                repository.findByIdAndUser_Id(id, userId)
                .orElse(null);

        if (existing == null) {
            return null;
        }

        existing.setName(incoming.getName());
        existing.setCategory(incoming.getCategory());
        existing.setFrequency(incoming.getFrequency());
        existing.setTargetGoal(incoming.getTargetGoal());
        existing.setCompletedDates(incoming.getCompletedDates());
        existing.setCreatedAt(incoming.getCreatedAt());

        return repository.save(existing);
    }

    // ===============================
    // DELETE HABIT
    // ===============================
    public void deleteHabit(
            Long id,
            String userEmail) {

        Long userId =
                ownershipService.requireUser(userEmail).getId();

        Habit existing =
                repository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Access denied"
                ));

        repository.delete(existing);
    }
}
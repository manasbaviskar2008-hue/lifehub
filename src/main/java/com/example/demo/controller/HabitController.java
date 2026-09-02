package com.example.demo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.entity.Habit;
import com.example.demo.service.HabitService;

@RestController
@RequestMapping("/api/habits")
@CrossOrigin(origins = "*")
public class HabitController {

    private final HabitService service;

    public HabitController(HabitService service) {
        this.service = service;
    }

    @GetMapping
    public List<Habit> getAllHabits(
            @RequestHeader("X-User-Email") String userEmail) {

        return service.getAllHabits(userEmail);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Habit> getHabitById(
            @PathVariable Long id,
            @RequestHeader("X-User-Email") String userEmail) {

        Habit habit = service.getHabitById(id, userEmail);

        return habit == null
                ? ResponseEntity.notFound().build()
                : ResponseEntity.ok(habit);
    }

    @PostMapping
    public Habit createHabit(
            @RequestHeader("X-User-Email") String userEmail,
            @RequestBody Habit habit) {

        return service.createHabit(habit, userEmail);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Habit> updateHabit(
            @PathVariable Long id,
            @RequestHeader("X-User-Email") String userEmail,
            @RequestBody Habit habit) {

        Habit updated = service.updateHabit(id, habit, userEmail);

        return updated == null
                ? ResponseEntity.notFound().build()
                : ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHabit(
            @PathVariable Long id,
            @RequestHeader("X-User-Email") String userEmail) {

        service.deleteHabit(id, userEmail);

        return ResponseEntity.noContent().build();
    }
}
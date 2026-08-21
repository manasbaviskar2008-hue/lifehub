package com.example.demo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.entity.Habit;
import com.example.demo.service.HabitService;

@RestController
@RequestMapping("/api/habits")
@CrossOrigin(origins = "http://localhost:5173")
public class HabitController {

    private final HabitService habitService;

    public HabitController(HabitService habitService) {
        this.habitService = habitService;
    }

    @GetMapping
    public List<Habit> getAllHabits() {
        return habitService.getAllHabits();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Habit> getHabitById(@PathVariable Long id) {

        Habit habit = habitService.getHabitById(id);

        if (habit == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(habit);
    }

    @PostMapping
    public Habit createHabit(@RequestBody Habit habit) {
        return habitService.createHabit(habit);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Habit> updateHabit(@PathVariable Long id,
                                             @RequestBody Habit habit) {

        Habit updatedHabit = habitService.updateHabit(id, habit);

        if (updatedHabit == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedHabit);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHabit(@PathVariable Long id) {

        Habit habit = habitService.getHabitById(id);

        if (habit == null) {
            return ResponseEntity.notFound().build();
        }

        habitService.deleteHabit(id);

        return ResponseEntity.noContent().build();
    }
}
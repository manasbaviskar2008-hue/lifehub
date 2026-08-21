package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.entity.Habit;
import com.example.demo.repository.HabitRepository;

@Service
public class HabitService {

    private final HabitRepository habitRepository;

    public HabitService(HabitRepository habitRepository) {
        this.habitRepository = habitRepository;
    }

    public List<Habit> getAllHabits() {
        return habitRepository.findAll();
    }

    public Habit getHabitById(Long id) {
        return habitRepository.findById(id).orElse(null);
    }

    public Habit createHabit(Habit habit) {
        return habitRepository.save(habit);
    }

    public Habit updateHabit(Long id, Habit habit) {

        Habit existingHabit = habitRepository.findById(id).orElse(null);

        if (existingHabit == null) {
            return null;
        }

        existingHabit.setName(habit.getName());
        existingHabit.setCategory(habit.getCategory());
        existingHabit.setFrequency(habit.getFrequency());
        existingHabit.setTargetGoal(habit.getTargetGoal());
        existingHabit.setCompletedDates(habit.getCompletedDates());

        return habitRepository.save(existingHabit);
    }

    public void deleteHabit(Long id) {
        habitRepository.deleteById(id);
    }
}
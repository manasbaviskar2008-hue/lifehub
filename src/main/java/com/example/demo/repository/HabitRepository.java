package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.entity.Habit;

public interface HabitRepository extends JpaRepository<Habit, Long> {

}
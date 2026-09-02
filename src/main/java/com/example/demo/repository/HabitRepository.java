package com.example.demo.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.entity.Habit;

public interface HabitRepository extends JpaRepository<Habit, Long> {
    List<Habit> findByUser_Id(Long userId);
    Optional<Habit> findByIdAndUser_Id(Long id, Long userId);
}

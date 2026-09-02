package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.Reminder;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {

    List<Reminder> findByUser_Id(Long userId);

    Optional<Reminder> findByIdAndUser_Id(Long id, Long userId);
}
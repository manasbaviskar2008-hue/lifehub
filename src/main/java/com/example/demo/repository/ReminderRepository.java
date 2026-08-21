package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.Reminder;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {

}
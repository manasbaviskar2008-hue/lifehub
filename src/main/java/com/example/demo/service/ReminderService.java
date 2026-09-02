package com.example.demo.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.entity.Reminder;
import com.example.demo.repository.ReminderRepository;

@Service
public class ReminderService {

    private final ReminderRepository repository;
    private final UserOwnershipService ownershipService;

    public ReminderService(
            ReminderRepository repository,
            UserOwnershipService ownershipService) {

        this.repository = repository;
        this.ownershipService = ownershipService;
    }

    // ===============================
    // ADD REMINDER
    // ===============================
    public Reminder addReminder(
            Reminder reminder,
            String userEmail) {

        reminder.setUser(
                ownershipService.requireUser(userEmail)
        );

        return repository.save(reminder);
    }

    // ===============================
    // GET ALL REMINDERS
    // ===============================
    public List<Reminder> getAllReminders(
            String userEmail) {

        Long userId =
                ownershipService.requireUser(userEmail).getId();

        return repository.findByUser_Id(userId);
    }

    // ===============================
    // GET REMINDER BY ID
    // ===============================
    public Reminder getReminderById(
            Long id,
            String userEmail) {

        Long userId =
                ownershipService.requireUser(userEmail).getId();

        return repository.findByIdAndUser_Id(id, userId)
                .orElse(null);
    }

    // ===============================
    // UPDATE REMINDER
    // ===============================
    public Reminder updateReminder(
            Long id,
            Reminder incoming,
            String userEmail) {

        Long userId =
                ownershipService.requireUser(userEmail).getId();

        Reminder existing =
                repository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Access denied"
                ));

        existing.setTitle(incoming.getTitle());
        existing.setDescription(incoming.getDescription());
        existing.setCategory(incoming.getCategory());
        existing.setDueDate(incoming.getDueDate());
        existing.setAmount(incoming.getAmount());
        existing.setStatus(incoming.getStatus());

        return repository.save(existing);
    }

    // ===============================
    // DELETE REMINDER
    // ===============================
    public void deleteReminder(
            Long id,
            String userEmail) {

        Long userId =
                ownershipService.requireUser(userEmail).getId();

        Reminder existing =
                repository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Access denied"
                ));

        repository.delete(existing);
    }
}
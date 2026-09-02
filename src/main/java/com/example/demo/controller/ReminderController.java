
package com.example.demo.controller;

import java.util.List;
import org.springframework.web.bind.annotation.*;
import com.example.demo.entity.Reminder;
import com.example.demo.service.ReminderService;

@RestController
@RequestMapping("/api/reminders")
@CrossOrigin(origins = "*")
public class ReminderController {

    private final ReminderService service;

    public ReminderController(ReminderService service) { this.service = service; }

    @PostMapping
    public Reminder addReminder(@RequestHeader("X-User-Email") String userEmail,
                                @RequestBody Reminder reminder) {
        return service.addReminder(reminder, userEmail);
    }

    @GetMapping
    public List<Reminder> getAllReminders(@RequestHeader("X-User-Email") String userEmail) {
        return service.getAllReminders(userEmail);
    }

    @GetMapping("/{id}")
    public Reminder getReminderById(@PathVariable Long id,
                                    @RequestHeader("X-User-Email") String userEmail) {
        return service.getReminderById(id, userEmail);
    }

    @PutMapping("/{id}")
    public Reminder updateReminder(@PathVariable Long id,
                                   @RequestHeader("X-User-Email") String userEmail,
                                   @RequestBody Reminder reminder) {
        return service.updateReminder(id, reminder, userEmail);
    }

    @DeleteMapping("/{id}")
    public void deleteReminder(@PathVariable Long id,
                               @RequestHeader("X-User-Email") String userEmail) {
        service.deleteReminder(id, userEmail);
    }
}
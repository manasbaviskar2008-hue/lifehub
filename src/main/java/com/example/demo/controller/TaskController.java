
package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.entity.Task;
import com.example.demo.service.TaskService;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:5173")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @PostMapping
    public Task addTask(
            @RequestHeader("X-User-Email") String userEmail,
            @RequestBody Task task) {

        return taskService.addTask(task, userEmail);
    }

    @GetMapping
    public List<Task> getAllTasks(
            @RequestHeader("X-User-Email") String userEmail) {

        return taskService.getTasks(userEmail);
    }

    @GetMapping("/{id}")
    public Task getTaskById(
            @PathVariable Long id,
            @RequestHeader("X-User-Email") String userEmail) {

        return taskService.getTaskById(id, userEmail);
    }

    @PutMapping("/{id}")
    public Task updateTask(
            @PathVariable Long id,
            @RequestHeader("X-User-Email") String userEmail,
            @RequestBody Task task) {

        return taskService.updateTask(id, task, userEmail);
    }

    @DeleteMapping("/{id}")
    public void deleteTask(
            @PathVariable Long id,
            @RequestHeader("X-User-Email") String userEmail) {

        taskService.deleteTask(id, userEmail);
    }
}
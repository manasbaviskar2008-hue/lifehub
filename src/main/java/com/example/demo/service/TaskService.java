
package com.example.demo.service;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.example.demo.entity.Task;
import com.example.demo.repository.TaskRepository;

@Service
public class TaskService {
    private final TaskRepository repository;
    private final UserOwnershipService ownershipService;

    public TaskService(TaskRepository repository, UserOwnershipService ownershipService) {
        this.repository = repository;
        this.ownershipService = ownershipService;
    }

    public Task addTask(Task task, String userEmail) {
        task.setUser(ownershipService.requireUser(userEmail));
        return repository.save(task);
    }

    public List<Task> getTasks(String userEmail) {
        Long userId = ownershipService.requireUser(userEmail).getId();
        return repository.findByUser_Id(userId);
    }

    public Task getTaskById(Long id, String userEmail) {
        Long userId = ownershipService.requireUser(userEmail).getId();
        return repository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Record not found"));
    }

    public Task updateTask(Long id, Task incoming, String userEmail) {
        Long userId = ownershipService.requireUser(userEmail).getId();
        Task existing = repository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied"));
        existing.setTitle(incoming.getTitle());
        existing.setDescription(incoming.getDescription());
        existing.setStatus(incoming.getStatus());
        return repository.save(existing);
    }

    public void deleteTask(Long id, String userEmail) {
        Long userId = ownershipService.requireUser(userEmail).getId();
        Task existing = repository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied"));
        repository.delete(existing);
    }
}

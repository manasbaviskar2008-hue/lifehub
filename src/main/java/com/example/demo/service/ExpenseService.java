
package com.example.demo.service;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.example.demo.entity.Expense;
import com.example.demo.repository.ExpenseRepository;

@Service
public class ExpenseService {
    private final ExpenseRepository repository;
    private final UserOwnershipService ownershipService;

    public ExpenseService(ExpenseRepository repository, UserOwnershipService ownershipService) {
        this.repository = repository;
        this.ownershipService = ownershipService;
    }

    public Expense addExpense(Expense expense, String userEmail) {
        expense.setUser(ownershipService.requireUser(userEmail));
        return repository.save(expense);
    }

    public List<Expense> getExpenses(String userEmail) {
        Long userId = ownershipService.requireUser(userEmail).getId();
        return repository.findByUser_Id(userId);
    }

    public Expense getExpenseById(Long id, String userEmail) {
        Long userId = ownershipService.requireUser(userEmail).getId();
        return repository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Record not found"));
    }

    public Expense updateExpense(Long id, Expense incoming, String userEmail) {
        Long userId = ownershipService.requireUser(userEmail).getId();
        Expense existing = repository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied"));
        existing.setTitle(incoming.getTitle());
        existing.setAmount(incoming.getAmount());
        existing.setCategory(incoming.getCategory());
        existing.setDate(incoming.getDate());
        return repository.save(existing);
    }

    public void deleteExpense(Long id, String userEmail) {
        Long userId = ownershipService.requireUser(userEmail).getId();
        Expense existing = repository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied"));
        repository.delete(existing);
    }
}

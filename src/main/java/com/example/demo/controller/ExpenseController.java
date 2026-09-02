
package com.example.demo.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.demo.entity.Expense;
import com.example.demo.service.ExpenseService;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {
    private final ExpenseService service;
    public ExpenseController(ExpenseService service) { this.service = service; }

    @PostMapping
    public Expense addExpense(@RequestHeader("X-User-Email") String userEmail,
                              @RequestBody Expense expense) {
        return service.addExpense(expense, userEmail);
    }
    @GetMapping
    public List<Expense> getExpenses(@RequestHeader("X-User-Email") String userEmail) {
        return service.getExpenses(userEmail);
    }
    @GetMapping("/{id}")
    public Expense getExpenseById(@PathVariable Long id,
                                  @RequestHeader("X-User-Email") String userEmail) {
        return service.getExpenseById(id, userEmail);
    }
    @PutMapping("/{id}")
    public Expense updateExpense(@PathVariable Long id,
                                 @RequestHeader("X-User-Email") String userEmail,
                                 @RequestBody Expense expense) {
        return service.updateExpense(id, expense, userEmail);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id,
                                              @RequestHeader("X-User-Email") String userEmail) {
        service.deleteExpense(id, userEmail);
        return ResponseEntity.noContent().build();
    }
}


package com.example.demo.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;

@Service
public class UserOwnershipService {
    private final UserRepository userRepository;

    public UserOwnershipService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User requireUser(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        }
        String normalizedEmail = email.trim().toLowerCase();
        return userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid user"));
    }
}

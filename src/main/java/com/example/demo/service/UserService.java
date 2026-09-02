
package com.example.demo.service;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User registerUser(User user) {
        if (user.getEmail() != null) {
            user.setEmail(user.getEmail().trim().toLowerCase());
        }
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User loginUser(String email, String password) {
        if (email == null || email.isBlank() || password == null) {
            return null;
        }

        User user = userRepository.findByEmailIgnoreCase(email.trim())
                .orElse(null);

        if (user != null && password.equals(user.getPassword())) {
            return user;
        }

        return null;
    }

    public User updateUser(Long id, User incoming) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        existing.setFullName(incoming.getFullName());
        existing.setPhone(incoming.getPhone());

        if (incoming.getEmail() != null && !incoming.getEmail().isBlank()) {
            existing.setEmail(incoming.getEmail().trim().toLowerCase());
        }

        if (incoming.getPassword() != null && !incoming.getPassword().isBlank()) {
            existing.setPassword(incoming.getPassword());
        }

        return userRepository.save(existing);
    }
}

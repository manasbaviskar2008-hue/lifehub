package com.example.demo.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByUser_Id(Long userId);
    Optional<Product> findByIdAndUser_Id(Long id, Long userId);
}
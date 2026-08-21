package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.entity.Product;
import com.example.demo.repository.ProductRepository;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public Product addProduct(Product product) {
        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository
                .findById(id)
                .orElse(null);
    }

    public Product updateProduct(
            Long id,
            Product product) {

        Product existingProduct =
                productRepository
                        .findById(id)
                        .orElse(null);

        if (existingProduct == null) {
            return null;
        }

        existingProduct.setName(
                product.getName());

        existingProduct.setCategory(
                product.getCategory());

        existingProduct.setPrice(
                product.getPrice());

        existingProduct.setPurchaseDate(
                product.getPurchaseDate());

        existingProduct.setWarrantyDate(
                product.getWarrantyDate());

        existingProduct.setStatus(
                product.getStatus());

        existingProduct.setNotes(
                product.getNotes());

        return productRepository.save(
                existingProduct);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}
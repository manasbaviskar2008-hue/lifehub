
package com.example.demo.service;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.example.demo.entity.Product;
import com.example.demo.repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository repository;
    private final UserOwnershipService ownershipService;

    public ProductService(ProductRepository repository, UserOwnershipService ownershipService) {
        this.repository = repository;
        this.ownershipService = ownershipService;
    }

    public Product addProduct(Product product, String userEmail) {
        product.setUser(ownershipService.requireUser(userEmail));
        return repository.save(product);
    }

    public List<Product> getAllProducts(String userEmail) {
        Long userId = ownershipService.requireUser(userEmail).getId();
        return repository.findByUser_Id(userId);
    }

    public Product getProductById(Long id, String userEmail) {
        Long userId = ownershipService.requireUser(userEmail).getId();
        return repository.findByIdAndUser_Id(id, userId).orElse(null);
    }

    public Product updateProduct(Long id, Product incoming, String userEmail) {
        Long userId = ownershipService.requireUser(userEmail).getId();
        Product existing = repository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied"));

        existing.setName(incoming.getName());
        existing.setCategory(incoming.getCategory());
        existing.setPrice(incoming.getPrice());
        existing.setPurchaseDate(incoming.getPurchaseDate());
        existing.setWarrantyDate(incoming.getWarrantyDate());
        existing.setStatus(incoming.getStatus());
        existing.setNotes(incoming.getNotes());
        return repository.save(existing);
    }

    public void deleteProduct(Long id, String userEmail) {
        Long userId = ownershipService.requireUser(userEmail).getId();
        Product existing = repository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied"));
        repository.delete(existing);
    }
}


package com.example.demo.controller;

import java.util.List;
import org.springframework.web.bind.annotation.*;
import com.example.demo.entity.Product;
import com.example.demo.service.ProductService;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) { this.service = service; }

    @PostMapping
    public Product addProduct(@RequestHeader("X-User-Email") String userEmail,
                              @RequestBody Product product) {
        return service.addProduct(product, userEmail);
    }

    @GetMapping
    public List<Product> getAllProducts(@RequestHeader("X-User-Email") String userEmail) {
        return service.getAllProducts(userEmail);
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id,
                                  @RequestHeader("X-User-Email") String userEmail) {
        return service.getProductById(id, userEmail);
    }

    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable Long id,
                                 @RequestHeader("X-User-Email") String userEmail,
                                 @RequestBody Product product) {
        return service.updateProduct(id, product, userEmail);
    }

    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id,
                              @RequestHeader("X-User-Email") String userEmail) {
        service.deleteProduct(id, userEmail);
    }
}
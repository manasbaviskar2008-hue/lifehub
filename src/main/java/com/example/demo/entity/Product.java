package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    private String name;
    private String category;
    private Double price;
    private String purchaseDate;
    private String warrantyDate;
    private String status;
    private String notes;

    public Product() {}

    public Product(Long id, String name, String category, Double price,
                   String purchaseDate, String warrantyDate,
                   String status, String notes) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.price = price;
        this.purchaseDate = purchaseDate;
        this.warrantyDate = warrantyDate;
        this.status = status;
        this.notes = notes;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(String purchaseDate) { this.purchaseDate = purchaseDate; }

    public String getWarrantyDate() { return warrantyDate; }
    public void setWarrantyDate(String warrantyDate) { this.warrantyDate = warrantyDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}

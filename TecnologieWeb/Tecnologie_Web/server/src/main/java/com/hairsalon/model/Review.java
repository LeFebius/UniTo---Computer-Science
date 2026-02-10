package com.hairsalon.model;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "reviews")
public class Review {
   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;

   @Column(nullable = false)
   private String name;

   @Column(nullable = false)
   private Integer rating;

   @Column(nullable = false, length = 1000)
   private String comment;

   @Column(nullable = false)
   private LocalDate date;

   @Column(name = "user_id")
   private String userId;

   // Costruttori
   public Review() {}

   public Review(String name, Integer rating, String comment, LocalDate date, String userId) {
       this.name = name;
       this.rating = rating;
       this.comment = comment;
       this.date = date;
       this.userId = userId;
   }

   // Getter e Setter
   public Long getId() {
       return id;
   }

   public void setId(Long id) {
       this.id = id;
   }

   public String getName() {
       return name;
   }

   public void setName(String name) {
       this.name = name;
   }

   public Integer getRating() {
       return rating;
   }

   public void setRating(Integer rating) {
       this.rating = rating;
   }

   public String getComment() {
       return comment;
   }

   public void setComment(String comment) {
       this.comment = comment;
   }

   public LocalDate getDate() {
       return date;
   }

   public void setDate(LocalDate date) {
       this.date = date;
   }

   public String getUserId() {
       return userId;
   }

   public void setUserId(String userId) {
       this.userId = userId;
   }
}
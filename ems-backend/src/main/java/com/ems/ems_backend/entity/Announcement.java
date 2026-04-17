package com.ems.ems_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "announcements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String type;        // GENERAL, POLICY, SYSTEM, ACHIEVEMENT\
    private String audience;    // ALL, MANAGERS, HR, ENGINEERING, SALES
    private String priority;    // HIGH, MEDIUM, LOW
    private String status;      // DRAFT, PUBLISHED, SCHEDULED, ARCHIVED

    @Column(name = "created_by")
    private String createdBy;

    private LocalDate createdAt;
    private LocalDate publishedAt;
    private LocalDate expiresAt;

    @Transient
    private Boolean publishImmediately;

    @Column(nullable = false)
    private Boolean active = true;

    private Integer viewCount = 0;
}
package com.ems.ems_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;

    private String priority;   // HIGH, MEDIUM, LOW
    private String status;     // PENDING, IN_PROGRESS, COMPLETED
    private String dueDate;
    private String createdAt;

    // Username of the person who assigned this task
    private String assignedBy;

    // Employee this task is assigned to
    private Long assignedToId;

    // Optional team assignment
    private Long teamId;
}
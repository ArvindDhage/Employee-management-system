package com.ems.ems_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Entity
@Table(name = "teams")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String teamName;
    private String department;
    private String description;

    @Column(name = "is_active")
    private boolean active;

    // Team lead stored as employee ID
    private Long teamLeadId;

    // Member employee IDs stored in a join table
    @ElementCollection
    @CollectionTable(name = "team_members", joinColumns = @JoinColumn(name = "team_id"))
    @Column(name = "employee_id")
    private List<Long> members;

    private String createdAt;
}
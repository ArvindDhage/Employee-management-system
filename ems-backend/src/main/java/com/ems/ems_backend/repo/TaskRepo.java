package com.ems.ems_backend.repo;

import com.ems.ems_backend.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepo extends JpaRepository<Task, Long> {

    List<Task> findByAssignedBy(String assignedBy);
    List<Task> findByAssignedToId(Long employeeId);
    List<Task> findByTeamId(Long teamId);
}
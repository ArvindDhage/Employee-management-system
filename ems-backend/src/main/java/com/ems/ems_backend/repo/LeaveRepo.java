package com.ems.ems_backend.repo;

import com.ems.ems_backend.entity.Leave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRepo extends JpaRepository<Leave, Long> {

    List<Leave> findByEmployeeIdOrderByStartDateDesc(Long employeeId);
    List<Leave> findByStatus(String status);
    long countByStatus(String status);
}
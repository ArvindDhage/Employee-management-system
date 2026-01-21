package com.ems.ems_backend.repo;

import com.ems.ems_backend.entity.Leave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRepo extends JpaRepository<Leave,Long> {
    List<Leave> findByEmployeeId(Long employeeId);

    List<Leave> findByStatus(String status);

    List<Leave> findByEmployeeIdAndStartDateBetween(Long employeeId, LocalDate start, LocalDate end);

}

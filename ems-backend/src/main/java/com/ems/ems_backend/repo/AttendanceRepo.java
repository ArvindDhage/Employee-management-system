package com.ems.ems_backend.repo;

import com.ems.ems_backend.entity.Attendance;
import com.ems.ems_backend.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepo extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByEmployeeAndAttendanceDate(Employee employee, LocalDate date);
    List<Attendance> findByEmployeeId(Long employeeId);
    long countByAttendanceDate(LocalDate date);
}
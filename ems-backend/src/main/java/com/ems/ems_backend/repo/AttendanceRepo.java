package com.ems.ems_backend.repo;

import com.ems.ems_backend.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepo extends JpaRepository<Attendance,Long> {
    Optional<Attendance> findByEmployeeIdAndAttendanceDate(Long employeeId, LocalDate date);

    List<Attendance> findByEmployeeIdAndAttendanceDateBetween(Long employeeId, LocalDate start, LocalDate end);

    List<Attendance> findByStatus(String status);

}

package com.ems.ems_backend.repo;

import com.ems.ems_backend.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepo extends JpaRepository<Announcement, Long> {

    List<Announcement> findByStatus(String status);
    List<Announcement> findByActiveTrue();
}
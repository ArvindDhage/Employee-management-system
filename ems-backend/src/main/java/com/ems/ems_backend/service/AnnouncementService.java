package com.ems.ems_backend.service;

import com.ems.ems_backend.entity.Announcement;
import com.ems.ems_backend.repo.AnnouncementRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnnouncementService {

    @Autowired private AnnouncementRepo announcementRepo;

    public Announcement save(Announcement announcement) {
        return announcementRepo.save(announcement);
    }

    public List<Announcement> findAll() {
        return announcementRepo.findAll();
    }

    public List<Announcement> findByStatus(String status) {
        return announcementRepo.findByStatus(status);
    }

    public List<Announcement> findAllActive() {
        return announcementRepo.findByActiveTrue();
    }

    @Transactional
    public void deactivate(Long id) {
        Announcement announcement = announcementRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));
        announcement.setActive(false);
        announcementRepo.save(announcement);
    }

    @Transactional
    public Announcement findById(Long id) {
        return announcementRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found: " + id));
    }

    public boolean existsById(Long id) {
        return announcementRepo.existsById(id);
    }

    public void deleteById(Long id) {
        announcementRepo.deleteById(id);
    }
}
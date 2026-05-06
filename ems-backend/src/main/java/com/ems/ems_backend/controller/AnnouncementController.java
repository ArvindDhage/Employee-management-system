package com.ems.ems_backend.controller;

import com.ems.ems_backend.entity.Announcement;
import com.ems.ems_backend.service.AnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
public class AnnouncementController {

    // FIX: Now delegates to AnnouncementService instead of calling AnnouncementRepo directly.
    // Previously AnnouncementService was dead code — never called by any controller.
    @Autowired
    private AnnouncementService announcementService;

    // ════════════════════════════════════════════════════════════════════════
    //  PUBLIC ENDPOINTS — all authenticated roles can read
    // ════════════════════════════════════════════════════════════════════════

    @GetMapping("/api/announcements")
    public ResponseEntity<List<Announcement>> getPublished() {
        return ResponseEntity.ok(announcementService.findByStatus("PUBLISHED"));
    }

    // ════════════════════════════════════════════════════════════════════════
    //  ADMIN ENDPOINTS
    // ════════════════════════════════════════════════════════════════════════

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/admin/announcements")
    public ResponseEntity<List<Announcement>> getAll() {
        return ResponseEntity.ok(announcementService.findAll());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/api/admin/announcements")
    public ResponseEntity<Announcement> create(
            @RequestBody Announcement announcement,
            Authentication auth) {

        announcement.setCreatedBy(auth.getName());

        announcement.setCreatedAt(LocalDate.now());

        announcement.setActive(true);
        announcement.setViewCount(0);

        if (Boolean.TRUE.equals(announcement.getPublishImmediately())) {
            announcement.setStatus("PUBLISHED");
            announcement.setPublishedAt(LocalDate.now());
        } else {
            announcement.setStatus("DRAFT");
        }

        return ResponseEntity.ok(announcementService.save(announcement));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/api/admin/announcements/{id}")
    public ResponseEntity<Announcement> update(
            @PathVariable Long id,
            @RequestBody Announcement updated) {
        Announcement existing = announcementService.findById(id);
        existing.setTitle(updated.getTitle());
        existing.setContent(updated.getContent());
        existing.setType(updated.getType());
        existing.setAudience(updated.getAudience());
        existing.setPriority(updated.getPriority());
        existing.setExpiresAt(updated.getExpiresAt());
        return ResponseEntity.ok(announcementService.save(existing));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/api/admin/announcements/{id}/publish")
    public ResponseEntity<Announcement> publish(@PathVariable Long id) {
        Announcement a = announcementService.findById(id);
        a.setStatus("PUBLISHED");
        a.setPublishedAt(LocalDate.now());
        return ResponseEntity.ok(announcementService.save(a));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/api/admin/announcements/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!announcementService.existsById(id))
            return ResponseEntity.notFound().build();
        announcementService.deleteById(id);
        return ResponseEntity.ok("Deleted");
    }
}
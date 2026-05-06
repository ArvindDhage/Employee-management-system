package com.ems.ems_backend.service;

import com.ems.ems_backend.entity.Team;
import com.ems.ems_backend.repo.EmployeeRepo;
import com.ems.ems_backend.repo.TeamRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TeamService {

    @Autowired private TeamRepo teamRepo;
    @Autowired private EmployeeRepo employeeRepo;

    public List<Map<String, Object>> getAllTeams() {
        return teamRepo.findAll().stream()
                .map(this::enrich)
                .collect(Collectors.toList());
    }

    public Optional<Map<String, Object>> getTeamById(Long id) {
        return teamRepo.findById(id).map(this::enrich);
    }

    public Map<String, Object> createTeam(Team team) {
        team.setCreatedAt(LocalDate.now().toString());
        team.setActive(true);
        return enrich(teamRepo.save(team));
    }

    public Map<String, Object> updateTeam(Long id, Team updated) {
        Team existing = teamRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        existing.setTeamName(updated.getTeamName());
        existing.setDepartment(updated.getDepartment());
        existing.setDescription(updated.getDescription());
        existing.setTeamLeadId(updated.getTeamLeadId());
        existing.setMembers(updated.getMembers());
        existing.setActive(updated.isActive());

        return enrich(teamRepo.save(existing));
    }

    public void deleteTeam(Long id) {
        if (!teamRepo.existsById(id))
            throw new RuntimeException("Team not found");

        teamRepo.deleteById(id);
    }

    public Map<String, Object> toggleStatus(Long id) {
        Team team = teamRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        team.setActive(!team.isActive());
        return enrich(teamRepo.save(team));
    }

    public boolean exists(Long id) {
        return teamRepo.existsById(id);
    }

    private Map<String, Object> enrich(Team team) {
        Map<String, Object> map = new LinkedHashMap<>();

        map.put("id", team.getId());
        map.put("teamName", team.getTeamName());
        map.put("department", team.getDepartment());
        map.put("description", team.getDescription());
        map.put("isActive", team.isActive());
        map.put("createdAt", team.getCreatedAt());
        map.put("memberCount", team.getMembers() != null ? team.getMembers().size() : 0);

        if (team.getTeamLeadId() != null) {
            employeeRepo.findById(team.getTeamLeadId()).ifPresentOrElse(lead -> {
                Map<String, Object> leadMap = new HashMap<>();
                leadMap.put("id", lead.getId());
                leadMap.put("firstName", lead.getFirstName());
                leadMap.put("lastName", lead.getLastName());
                leadMap.put("email", lead.getEmail());
                map.put("teamLead", leadMap);
            }, () -> map.put("teamLead", null));
        } else {
            map.put("teamLead", null);
        }

        // 🔥 MEMBERS FIXED (NO CRASH)
        List<Map<String, Object>> memberList = new ArrayList<>();

        if (team.getMembers() != null) {
            for (Long memberId : team.getMembers()) {
                if (memberId == null) continue;

                employeeRepo.findById(memberId).ifPresent(emp -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", emp.getId());
                    m.put("firstName", emp.getFirstName());
                    m.put("lastName", emp.getLastName());
                    m.put("email", emp.getEmail());
                    memberList.add(m);
                });
            }
        }

        map.put("members", memberList);

        return map;
    }
}
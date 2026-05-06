package com.ems.ems_backend.service;

import com.ems.ems_backend.entity.Employee;
import com.ems.ems_backend.entity.Task;
import com.ems.ems_backend.repo.EmployeeRepo;
import com.ems.ems_backend.repo.TaskRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired private TaskRepo taskRepo;
    @Autowired private EmployeeRepo employeeRepo;

    public List<Map<String, Object>> getAllTasks() {
        return taskRepo.findAll().stream().map(this::enrich).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getTasksByAssignedBy(String username) {
        return taskRepo.findByAssignedBy(username).stream().map(this::enrich).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getTasksByEmployee(Long empId) {
        return taskRepo.findByAssignedToId(empId).stream().map(this::enrich).collect(Collectors.toList());
    }

    public Map<String, Object> createTask(Task task, String assignedBy) {
        task.setAssignedBy(assignedBy);
        task.setCreatedAt(LocalDate.now().toString());
        if (task.getStatus() == null) task.setStatus("PENDING");
        if (task.getPriority() == null) task.setPriority("MEDIUM");
        return enrich(taskRepo.save(task));
    }

    public Map<String, Object> updateStatus(Long id, String status) {
        Task task = taskRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setStatus(status.toUpperCase());
        return enrich(taskRepo.save(task));
    }

    public Map<String, Object> updateTask(Long id, Task updated) {
        Task existing = taskRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setPriority(updated.getPriority());
        existing.setStatus(updated.getStatus());
        existing.setDueDate(updated.getDueDate());
        existing.setAssignedToId(updated.getAssignedToId());
        return enrich(taskRepo.save(existing));
    }

    public void deleteTask(Long id) {
        if (!taskRepo.existsById(id))
            throw new RuntimeException("Task not found");
        taskRepo.deleteById(id);
    }

    public boolean exists(Long id) {
        return taskRepo.existsById(id);
    }

    private Map<String, Object> enrich(Task task) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id",          task.getId());
        map.put("title",       task.getTitle());
        map.put("description", task.getDescription());
        map.put("priority",    task.getPriority());
        map.put("status",      task.getStatus());
        map.put("dueDate",     task.getDueDate());
        map.put("createdAt",   task.getCreatedAt());
        map.put("assignedBy",  task.getAssignedBy());

        if (task.getAssignedToId() != null) {
            employeeRepo.findById(task.getAssignedToId()).ifPresent(emp -> {
                Map<String, Object> assignee = new HashMap<>();
                assignee.put("id",         emp.getId());
                assignee.put("firstName",  emp.getFirstName());
                assignee.put("lastName",   emp.getLastName());
                assignee.put("email",      emp.getEmail());
                assignee.put("department", emp.getDepartment() != null
                        ? emp.getDepartment().getName() : null);
                map.put("assignedTo", assignee);
            });
        }
        return map;
    }
}
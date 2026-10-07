package com.example.HealthcareSystem_Backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String action; 
    private String module; 
    private String description;
    private LocalDateTime timestamp;
}
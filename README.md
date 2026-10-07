MediCore Hospital Management System (HMS)

MediCore HMS is an enterprise-grade healthcare management application designed to centralize hospital operations, automate clinical workflows, and provide role-based access control (RBAC) across administrative and medical domains.

Key Features

    Role-Based Access Control (RBAC): Granular permissions for ADMIN, DOCTOR, NURSE, ACCOUNTANT, LAB_STAFF, PHARMACIST, and RECEPTIONIST.

    Staff & HR Management: Unified employee directory, administrative employee registration, department assignments, shift check-in/out, and leave application reviews.

    Patient Records: Inpatient/outpatient registrations, complete demographic profiles, and medical histories.

    Appointments & Doctor Schedules: Automated schedule conflict detection (preventing overlapping appointments within 15-minute intervals) and specialist assignments.

    Inpatient Ward Management: Real-time bed occupancy verification to prevent double-booking, ward allocation, and discharge processing.

    Pharmacy & Inventory: Stock deduction upon fulfillment, expiration validation before dispensing, and digital prescription tracking.

    Billing & Payments: Invoicing, partial and full payment reconciliation, and receipt generation.

    Audit Logging: Automated event logging capturing user actions across authentication, patient intake, staff changes, and financial records.

🛠️ Tech Stack
Backend

    Language & Framework: Java 17+, Spring Boot 3

    Security: Spring Security with Stateless JWT Authentication & BCrypt password encryption

    Persistence: Spring Data JPA / Hibernate

    Database: MySQL 8.0 (Hosted on Aiven Cloud)

    Build Tool: Apache Maven

Frontend

    Core: React 18, TypeScript, Vite

    Styling: Tailwind CSS

    Icons: Lucide React

    HTTP Client: Axios (configured with authorization interceptors)

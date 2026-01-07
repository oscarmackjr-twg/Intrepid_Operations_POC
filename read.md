## Loan_Engine
#
# Developed for TWG Global/Intrepid
# omack@twgglobal.com
# 
A.  Basic operations

1.  Back End Startup

cd backend
npm start:test


2.  Front End Starup

cd frontend
npm run dev


3.  Run Python Pipeline (Windows)




B.   Technical Overview


1. Business Context & Objectives
The Loan Engine platform processes loan portfolio data, applies configurable business rules, and produces exception reporting and analytic outputs. The platform is used by analysts and operations teams to validate loan tapes, enforce policy compliance, and generate structured data for downstream systems or reporting tools.
Key business objectives include:
•	Automated execution of portfolio-level pipeline runs
•	Clear audit trails and exception management
•	Standardized ingestion of loan data files
•	Rule-driven loan validation and analytics
•	Secure, repeatable, and monitored processing
2. Solution Overview
The solution is implemented as a modular architecture consisting of a web-based analytical user interface, a stateless REST API backend, and a Python-based processing pipeline. Data persistence is implemented through a PostgreSQL database, and pipeline input/output artifacts are retained in file storage.
Primary components include:
•	React Web Application – analyst-facing UI
•	Node.js/Express REST API – orchestration and integration layer
•	Python Pipeline Engine – business rules and calculations
•	PostgreSQL Database – authoritative storage for runs, exceptions, and facts
•	File Storage – inputs and generated pipeline artifacts
3. Functional Capabilities
•	End‑to‑end portfolio processing runs
•	Exception rule evaluation and management
•	Run status tracking and auditability
•	Loan-level analytics and drill-down
•	Integration via REST APIs
•	Extensible Python-based business rule engine
4. Technical Architecture & Stack
Major technology components:
•	Frontend: React, TypeScript
•	Backend: Node.js, Express, TypeScript
•	Processing: Python 3.x
•	Database: PostgreSQL
•	Dev Tooling: Vite, tsx/ts-node
•	Deployment: container-ready, CI/CD compatible
5. API Surface Summary
•	/api/runs – list and paginate pipeline runs
•	/api/summary/:runId – retrieve roll‑up metrics
•	/api/exceptions – retrieve exception rows
•	/api/pipeline/run – initiate processing execution
6. Security & Compliance Expectations
•	TLS/HTTPS transport security
•	Authentication/authorization integration capability
•	Logging and audit event retention policies
•	PII data handling and masking considerations
•	Configurable data‑retention controls

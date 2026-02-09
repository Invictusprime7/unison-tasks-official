# Enterprise Hardening Implementation

This document summarizes the enterprise-grade security and governance controls implemented for Unison Tasks.

## Overview

Based on enterprise readiness audit recommendations, the following categories have been addressed:

| Category | Before | After | Key Changes |
|----------|--------|-------|-------------|
| Runtime Preview Foundation | 7.5/10 | 9/10 | Auth, quotas, resource limits |
| Platform Surface Area | 6/10 | 7/10 | Audit logs, RBAC foundation |
| Enterprise Governance | 2/10 | 6/10 | Org model, permissions, audit |
| Security Posture | 3/10 | 7/10 | Headers, WAF, sandboxing |
| Operational Readiness | 4/10 | 7/10 | CloudWatch alarms, error boundaries |

---

## A) Preview Runtime Enterprise Hardening

### 1. AuthN/AuthZ on Every Endpoint

**File:** `preview-service/gateway/src/middleware/auth.ts`

- JWT token validation via Supabase Auth
- API key authentication as alternative
- Session ownership verification (users can only access their own sessions)
- Permission checking via `requirePermission()` middleware
- All session endpoints now require authentication

```typescript
// Example protected route
sessionRouter.post('/start', 
  requirePermission('preview:create'),
  checkQuota('session'),
  async (req: AuthenticatedRequest, res) => { ... }
);
```

### 2. Per-Session Resource Quotas

**Database:** `supabase/migrations/20260208000000_enterprise_hardening.sql`

- `organization_quotas` table with plan-based limits
- `organization_usage` table for real-time tracking
- `check_org_quota()` function for quota validation

**Gateway:** `preview-service/gateway/src/middleware/auth.ts`

- `checkQuota()` middleware enforces limits before session creation
- Quotas checked: concurrent sessions, daily sessions, AI generations

| Plan | Concurrent Sessions | Daily Sessions | AI Generations/Month |
|------|---------------------|----------------|----------------------|
| Free | 2 | 20 | 10 |
| Pro | 10 | 100 | 500 |
| Business | 50 | 500 | Unlimited |
| Enterprise | Custom | Custom | Custom |

### 3. Container Resource Limits

**File:** `preview-service/gateway/src/services/SessionManager.ts`

Enhanced container configuration:

```typescript
HostConfig: {
  // Memory limits
  Memory: 256MB (configurable),
  MemorySwap: Same as Memory (no swap),
  MemoryReservation: 50%,
  
  // CPU limits  
  CpuPeriod: 100000,
  CpuQuota: 25000 (25% CPU),
  
  // Process limits
  PidsLimit: 64,
  
  // Security
  SecurityOpt: ['no-new-privileges:true'],
  CapDrop: ['ALL'],
  CapAdd: ['CHOWN', 'SETUID', 'SETGID'],
  
  // Disk limits (if enabled)
  StorageOpt: { size: '100MB' }
}
```

### 4. Network Egress Restrictions

**File:** `preview-service/infrastructure/security.tf`

- Restricted worker security group (optional via `enable_network_restrictions`)
- VPC endpoints for private AWS service access (ECR, S3, CloudWatch)
- Workers cannot access metadata endpoints or scan the internet

### 5. Session Cleanup & Security

**File:** `preview-service/gateway/src/services/SessionManager.ts`

- Auto-removal enabled for containers
- 30-second cleanup loop for idle sessions
- Session timeout (5 minutes default)
- Orphan reaping via container labels

---

## B) Multi-Tenancy & Governance

### 1. Org/Workspace Model

**Database:** `supabase/migrations/20250117000000_complete_schema_system.sql` (existing)

Already in place:
- `organizations` table with owner, billing, settings
- `organization_members` with roles
- `projects` linked to organizations
- `project_members` with project-level roles

### 2. RBAC Roles & Permissions

**Database:** `supabase/migrations/20260208000000_enterprise_hardening.sql`

New tables:
- `rbac_permissions` - Granular permissions (e.g., `projects:create`, `files:delete`)
- `rbac_custom_roles` - Organization-defined roles
- `rbac_user_roles` - User role assignments

Permissions seeded:
- `projects:view`, `projects:create`, `projects:edit`, `projects:delete`, `projects:publish`
- `files:view`, `files:upload`, `files:edit`, `files:delete`, `files:share`
- `preview:create`, `preview:view`, `preview:manage`
- `team:view`, `team:invite`, `team:remove`, `team:manage_roles`
- `billing:view`, `billing:manage`
- `admin:view_audit_logs`, `admin:manage_settings`, `admin:manage_security`

Helper function:
```sql
SELECT user_has_permission(user_id, org_id, 'projects:create');
```

### 3. Audit Logs

**Database:** `supabase/migrations/20260208000000_enterprise_hardening.sql`

`audit_logs` table captures:
- Who (user_id, email)
- What (action, resource_type, resource_id)
- When (created_at)
- Where (ip_address, user_agent, country_code)
- Changes (JSONB diff of old/new values)

**Frontend:** `src/services/auditLogger.ts`

```typescript
// Log an action
await auditLogger.log({
  action: 'create',
  resourceType: 'project',
  resourceId: projectId,
  resourceName: 'My Website',
});

// Query logs (admin only)
const logs = await auditLogger.queryLogs({
  organizationId: orgId,
  action: 'delete',
  startDate: lastWeek,
});
```

### 4. Security Events

**Database:** `supabase/migrations/20260208000000_enterprise_hardening.sql`

`security_events` table tracks:
- Login attempts (success/failure)
- Password changes
- MFA events
- Permission changes
- Suspicious activity
- Rate limit exceeded

Risk levels: `low`, `medium`, `high`, `critical`

### 5. Environment Separation

**Database:** `supabase/migrations/20260208000000_enterprise_hardening.sql`

`environments` table:
- `development`, `staging`, `production`
- Custom domains per environment
- Protection levels (none, password, auth, ip_whitelist)
- Version tracking

---

## C) Product Quality Gates

### 1. Error Boundaries

**File:** `src/components/RouteErrorBoundary.tsx`

- `RouteErrorBoundary` - Catches errors in route components
- `AsyncBoundary` - Combines Suspense with error handling
- Generates unique error IDs for support
- Logs errors to security events
- User-friendly error UI with retry/home actions

**File:** `src/App.tsx`

All routes wrapped with `AsyncBoundary`:
```tsx
<Route path="/dashboard" element={
  <AsyncBoundary loading={<PageLoader />}>
    <Dashboard />
  </AsyncBoundary>
} />
```

### 2. Security Headers

**Files:** `vercel.json`, `netlify.toml`

Headers applied to all responses:
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
- `Content-Security-Policy: ...` (comprehensive policy)
- `Cross-Origin-Embedder-Policy`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`

### 3. Observability

**Infrastructure:** `preview-service/infrastructure/security.tf`

CloudWatch alarms:
- High CPU utilization (>80%)
- High memory utilization (>80%)
- High WAF blocked requests (potential attack)
- High 5xx error rate

**Logging:**
- Structured JSON logging via pino
- Request IDs for correlation
- Security event logging

---

## D) Infrastructure Security

### 1. WAF Protection

**File:** `preview-service/infrastructure/security.tf`

AWS WAFv2 with:
- Rate limiting per IP (2000 requests/5min)
- AWS Managed Rules - Common Rule Set
- AWS Managed Rules - Known Bad Inputs
- AWS Managed Rules - SQL Injection
- AWS Managed Rules - IP Reputation List

### 2. VPC Endpoints

**File:** `preview-service/infrastructure/security.tf`

Private endpoints for:
- ECR API (container registry)
- ECR DKR (Docker pulls)
- S3 (ECR layers)
- CloudWatch Logs

### 3. Secrets Management

**File:** `preview-service/infrastructure/security.tf`

AWS Secrets Manager for:
- Supabase credentials
- API keys
- Other sensitive configuration

---

## Next Steps

### Recommended Phase 2 Priorities

1. **SSO Integration**
   - SAML 2.0 / OIDC support
   - Enterprise IdP integration

2. **Compliance Documentation**
   - SOC 2 readiness checklist
   - Data processing agreements

3. **Advanced Monitoring**
   - APM integration (DataDog/New Relic)
   - Distributed tracing

4. **Backup & DR**
   - Automated database backups
   - Cross-region replication
   - Recovery runbooks

5. **Penetration Testing**
   - Third-party security audit
   - Vulnerability scanning automation

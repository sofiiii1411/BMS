# SentinelAI — Building Management System (BMS)
### Intelligent Role-Based Access Control & Digital Twin

SentinelAI is an enterprise-grade Building Management System equipped with real-time 3D Digital Twin visualization, BACnet telemetry simulation, and zero-trust Role-Based Access Control (RBAC).

---

## 🔐 Authorized Accounts & Permission Matrix

Access to SentinelAI is cryptographically restricted and enforced on the backend. Only the following **seven authorized Gmail accounts** are permitted to log in:

### 1. Floor Operators (10 Rooms Per Floor — Isolated Scope)
Each floor user has strict access **only** to their assigned floor and its 10 rooms. Access attempts to other floors or administrative tools are blocked by the backend API with `403 Forbidden`.

| Account | Role | Allowed Scope | Room Numbers | Zone Description |
| :--- | :--- | :--- | :--- | :--- |
| `floor1.sentinelai@gmail.com` | Floor 1 Operator | **Floor 1 Only** | Rooms 101 – 110 | Ground Level & Reception Atrium |
| `floor2.sentinelai@gmail.com` | Floor 2 Operator | **Floor 2 Only** | Rooms 201 – 210 | Engineering & R&D Labs |
| `floor3.sentinelai@gmail.com` | Floor 3 Operator | **Floor 3 Only** | Rooms 301 – 310 | Commercial & Client Experience |
| `floor4.sentinelai@gmail.com` | Floor 4 Operator | **Floor 4 Only** | Rooms 401 – 410 | Corporate Services & Finance |
| `floor5.sentinelai@gmail.com` | Floor 5 Operator | **Floor 5 Only** | Rooms 501 – 510 | Executive Command Penthouse |

### 2. Overall Administration Users (All 5 Floors & 50 Rooms)
Both authorized administrators possess overall facility clearance across all 5 floors and all 50 rooms.

| Account | Title | Clearance | Exclusive Capabilities |
| :--- | :--- | :--- | :--- |
| `securitysuper.sentinelai@gmail.com` | **Security Super Admin** | L5 - Top Secret Security | • Master Emergency 50-Room Lockdown Protocol<br>• Real-time Access Audit Trail & Biometric Logs<br>• CCTV & Intrusion Monitoring Matrix<br>• Threat Level Calibration (DEFCON 1–5) |
| `global.sentinelai@gmail.com` | **Global Administrator** | L5 - Enterprise Executive | • Facility-Wide HVAC Automation Override (Eco / Performance)<br>• 50-Room Grid Energy Load Optimization<br>• Authorized Accounts & Whitelist Policy Registry<br>• Edge BACnet Gateway Diagnostics |

---

## 🛡️ Security Architecture & Backend Enforcement

1. **Zero Client-Side Credentials**:
   - Authorized account lists, permissions, and session tokens are strictly evaluated and managed by the backend server (`server/`).
   - No secret keys or clearance credentials are baked into client-side JS bundles.

2. **Cryptographic Token Issuance**:
   - Upon successful login (via Google ID Token verification or pre-approved Gmail authentication), the backend issues a cryptographically random session token (`snai_<random_bytes>`).
   - Every request to `/api/*` requires `Authorization: Bearer <token>`.

3. **Backend-Enforced Floor Isolation**:
   - Endpoints like `/api/floors/:floorId/rooms` and `/api/rooms/:roomId/control` inspect the token's `allowedFloors` array.
   - If `floor1.sentinelai@gmail.com` queries Floor 2 or any other unauthorized floor, the backend immediately halts execution and returns:
     ```json
     {
       "success": false,
       "error": "FORBIDDEN_FLOOR_ACCESS",
       "message": "Security Violation: Your account (floor1.sentinelai@gmail.com) is restricted to Floor(s) [1]. Access to Floor 2 is denied by SentinelAI security policy."
     }
     ```

4. **Audit Logging**:
   - Every login attempt (granted or denied), floor navigation, and room control action is immutably logged to the security audit trail in the Security Operations Center.

---

## 🚀 Running the Application Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server** (Runs frontend and backend API together):
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

3. **Production Build**:
   ```bash
   npm run build
   ```

---

## 🧪 Testing the Access Control in the UI

1. Open `http://localhost:5173/`.
2. Under **Authorized Accounts Portal**, click any of the 7 accounts to log in instantly with real backend verification.
3. Test **Floor 1 User** (`floor1.sentinelai@gmail.com`):
   - Notice the Topbar scope badge: `RESTRICTED SCOPE: FLOOR 1 (101 - 110, 10 ROOMS)`.
   - In **3D Digital Twin**, other floors are locked.
   - In **Rooms**, only Rooms 101–110 are shown.
   - Security SOC and Enterprise Admin in the sidebar are locked.
4. Sign out and log in as **Security Super Admin** (`securitysuper.sentinelai@gmail.com`):
   - Full 5-floor selector in 3D Digital Twin and 50 rooms.
   - Access to **Security SOC Command** with Emergency 50-Room Lockdown and audit logs.
5. Sign out and test the **"Test Unauthorized Login"** button (`intruder.unauthorized@gmail.com`):
   - Notice the red alert: `ACCESS DENIED: Account is not recognized or authorized. Only pre-approved Gmail accounts may enter.`

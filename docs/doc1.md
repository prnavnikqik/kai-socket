
***

## ✅ 1. **Vision & Goal**

*   **Objective:** Automatically fetch **Microsoft Teams meeting transcripts** after the meeting ends, parse them, and store structured data in **MongoDB** for search, analytics, and future features.
*   **Why:**
    *   Avoid manual note-taking.
    *   Enable searchable meeting history.
    *   Provide foundation for summaries, insights, and compliance.

***

## ✅ 2. **High-Level Architecture**

    Teams Meeting → Microsoft Graph → Transcript Fetcher Service → MongoDB Atlas

**Flow:**

1.  **Teams generates transcript** (WebVTT) when transcription is enabled and started.
2.  **Microsoft Graph** exposes transcript via API after meeting ends.
3.  **Our service**:
    *   Receives **Graph webhook notification** (transcript ready).
    *   Fetches `.vtt` file from Graph.
    *   Parses timestamps + speaker names.
    *   Stores structured JSON in MongoDB.
4.  **Downstream APIs** for search, reporting, and analytics.

***

## ✅ 3. **Core Components**

### **A. Microsoft Graph Integration**

*   **APIs needed:**
    *   `GET /onlineMeetings/{id}/transcripts` → list transcripts.
    *   `GET /onlineMeetings/{id}/transcripts/{id}/content` → fetch `.vtt`.
*   **Auth:**
    *   **OAuth 2.0 client credentials** flow.
    *   Permissions: `OnlineMeetings.Read.All` (application-level).
*   **Admin consent required.**

### **B. Transcript Fetcher Service**

*   **Language:** JavaScript 
*   **Responsibilities:**
    *   Handle **Graph webhook notifications**.
    *   Fetch transcript content.
    *   Parse WebVTT → structured JSON.
    *   Store in MongoDB.
    *   Expose health/read APIs.

### **C. MongoDB Atlas**

*   **Collections:**
    *   `meeting_transcripts`:
        ```json
        {
          "meetingId": "...",
          "transcriptId": "...",
          "createdAt": "...",
          "entries": [
            { "start": "00:01:23.456", "end": "00:01:26.789", "speaker": "Alice", "text": "Hello team" }
          ]
        }
        ```
*   **Indexes:**
    *   `meetingId` (for retrieval).
    *   Text index on `entries.text` (for search).

***

## ✅ 4. **Coding Requirements**

*   **Frameworks:**
    *   `express` (API server).
    *   `axios` (HTTP calls to Graph).
    *   `mongodb` (MongoDB driver).
*   **Environment:**
    *   Node.js 18+.
    *   Docker for containerization.
*   **Secrets:**
    *   TENANT\_ID, CLIENT\_ID, CLIENT\_SECRET → store in Azure Key Vault.
    *   MONGO\_URI → secure in Key Vault.

***

## ✅ 5. **Process to Build**

### **Phase 1: Setup**

*   Register **Azure AD app** → get client credentials.
*   Enable **Teams transcription policy** in admin center.
*   Create **MongoDB Atlas cluster** (start with Free tier).

### **Phase 2: Core Service**

*   Implement:
    *   **Graph token fetch** (OAuth client credentials).
    *   **Webhook endpoint** for transcript notifications.
    *   **Transcript fetch** from Graph.
    *   **WebVTT parser** (timestamps + speaker).
    *   **MongoDB insert** logic.

### **Phase 3: Deployment**

*   Containerize with **Docker**.
*   Deploy on **Azure App Service** or **Azure Container Apps**.
*   Configure **webhook URL** in Graph subscription.

### **Phase 4: Testing**

*   **Unit tests:**
    *   VTT parsing (edge cases: missing speaker, empty lines).
    *   MongoDB insert.
*   **Integration tests:**
    *   Mock Graph API responses.
    *   Validate webhook → fetch → store flow.
*   **Load tests:**
    *   Simulate multiple notifications.

***

## ✅ 6. **Testing Checklist**

*   ✅ Transcript fetch works for real meeting IDs.
*   ✅ VTT parser handles:
    *   Speaker lines.
    *   No-speaker lines.
    *   Timestamp format.
*   ✅ MongoDB stores correct structure.
*   ✅ API returns health status.
*   ✅ Error handling for:
    *   Invalid Graph token.
    *   Missing transcript.
    *   MongoDB connection failure.

***

## ✅ 7. **Security & Compliance**

*   Use **HTTPS** for webhook.
*   Validate **Graph notifications** (signature).
*   Store secrets in **Key Vault**.
*   Respect **retention policies** (don’t override Teams compliance).

***

## ✅ 8. **Roadmap**

*   **MVP:** Fetch + store transcripts.
*   **Next:**
    *   Add **search API** (`/search?q=`).
    *   Add **meeting summary generator** (AI).
    *   Add **dashboard** for transcript browsing.
*   **Future:**
    *   Integrate with **Power BI** for analytics.
    *   Add **keyword alerts** (e.g., “action items”).

***

## ✅ 9. **Presentation Outline**

*   **Slide 1:** Problem → “Manual notes waste time.”
*   **Slide 2:** Solution → “Automated transcript pipeline.”
*   **Slide 3:** Architecture diagram.
*   **Slide 4:** Cost breakdown:
    *   Graph API: $0 (unmetered).
    *   Hosting: \~$0.096/hr (Linux VM).
    *   MongoDB: Free → $8 → $57+ tiers.
*   **Slide 5:** Roadmap (MVP → AI summaries).
*   **Slide 6:** Demo flow (Webhook → Fetch → Store → Query).

***

## ✅ 10. **What You Need to Build**

*   **Graph subscription script** (register webhook).
*   **Webhook service** (Express app).
*   **Graph fetch logic**.
*   **WebVTT parser**.
*   **MongoDB integration**.
*   **Dockerfile** for deployment.
*   **Basic tests** (unit + integration).

***

## ✅ 11. **How You Could Build It**

*   Start with **local Node.js app**.
*   Use **ngrok** for webhook testing.
*   Mock Graph API for dev.
*   Deploy to **Azure App Service**.
*   Connect to **MongoDB Atlas**.

***

## ✅ 12. **What to Test Before Go-Live**

*   ✅ End-to-end flow with real Teams meeting.
*   ✅ Error handling for missing transcript.
*   ✅ MongoDB indexing for search.
*   ✅ Security (validate Graph notifications).
*   ✅ Performance under multiple notifications.

***


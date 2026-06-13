# Feature: Frontend Integration API
**Tech Stack:** Amazon API Gateway (HTTP API), AWS Lambda
**Objective:** Two clean endpoints for the React frontend to call.

**Requirements:**
- POST /evaluate-return — Body: { item_id, category, condition_notes, simulated_image_label } — Triggers grade_and_route Lambda, returns full grading JSON.
- GET /health-card/{item_id} — Calls db_client.get_item(), returns the stored Product Health Card.
- Use HTTP API type (not REST API) — faster to set up, auto CORS support.
- Enable CORS for all origins during hackathon.
- Both endpoints return Content-Type: application/json.

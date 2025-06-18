# SYJ PM-POS Web

A web-based POS system for sales and due balance data entry, integrated with Google BigQuery.

## Setup

1. **Create BigQuery Tables**:
   - Create `SYJPMOPMHSalesData`, `SYJPMOPMHBillNumbers`, and `SYJPMOPMHBalanceDue` in Google Cloud Console using the provided schemas.
   - Ensure your service account has BigQuery Data Editor and Job User roles.

2. **Set Up Google Cloud Project**:
   - Create a project in Google Cloud Console (e.g., `sy-jpm-pos-web`).
   - Enable BigQuery and Cloud Run APIs.
   - Create a service account key and store it as `GCP_SA_KEY` in GitHub Secrets.

3. **Clone Repository**:
   ```bash
   git clone https://github.com/kbov6206/SYJPMOPMH_pos_web.git
   cd SYJPMOPMH_pos_web
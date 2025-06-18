<script type="text/javascript">
        var gk_isXlsx = false;
        var gk_xlsxFileLookup = {};
        var gk_fileData = {};
        function filledCell(cell) {
          return cell !== '' && cell != null;
        }
        function loadFileData(filename) {
        if (gk_isXlsx && gk_xlsxFileLookup[filename]) {
            try {
                var workbook = XLSX.read(gk_fileData[filename], { type: 'base64' });
                var firstSheetName = workbook.SheetNames[0];
                var worksheet = workbook.Sheets[firstSheetName];

                // Convert sheet to JSON to filter blank rows
                var jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false, defval: '' });
                // Filter out blank rows (rows where all cells are empty, null, or undefined)
                var filteredData = jsonData.filter(row => row.some(filledCell));

                // Heuristic to find the header row by ignoring rows with fewer filled cells than the next row
                var headerRowIndex = filteredData.findIndex((row, index) =>
                  row.filter(filledCell).length >= filteredData[index + 1]?.filter(filledCell).length
                );
                // Fallback
                if (headerRowIndex === -1 || headerRowIndex > 25) {
                  headerRowIndex = 0;
                }

                // Convert filtered JSON back to CSV
                var csv = XLSX.utils.aoa_to_sheet(filteredData.slice(headerRowIndex)); // Create a new sheet from filtered array of arrays
                csv = XLSX.utils.sheet_to_csv(csv, { header: 1 });
                return csv;
            } catch (e) {
                console.error(e);
                return "";
            }
        }
        return gk_fileData[filename] || "";
        }
        </script># SYJ PM-POS Web

A web-based POS system for sales and due balance data entry, integrated with Google BigQuery.

## Setup

1. **Create BigQuery Tables**:
   - Create `SYJPMOPMHSalesData`, `SYJPMOPMHBillNumbers`, and `SYJPMOPMHBalanceDue` in Google Cloud Console using the provided schemas.
   - Ensure your service account has BigQuery Data Editor and Job User roles.

2. **Set Up Google Cloud Project**:
   - Create a project in Google Cloud Console.
   - Enable BigQuery and Cloud Run APIs.
   - Create a service account key and store it as `GCP_SA_KEY` in GitHub Secrets.

3. **Clone Repository**:
   ```bash
   git clone https://github.com/your-username/sy-jpm-pos-web.git
   cd sy-jpm-pos-web
   ```

4. **Install Dependencies**:
   ```bash
   npm install
   ```

5. **Environment Variables**:
   - Create a `.env` file:
     ```env
     GOOGLE_CLOUD_PROJECT=your-project-id
     GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
     ```

6. **Run Locally**:
   ```bash
   npm start
   ```
   - Serve frontend locally with a static server (e.g., `npx http-server docs`).
   - Access at `http://localhost:8080`.

## Deployment

1. **Frontend (GitHub Pages)**:
   - Enable GitHub Pages in repository settings, selecting the `docs` folder.
   - Access at `https://your-username.github.io/sy-jpm-pos-web`.

2. **Backend (Google Cloud Run)**:
   - Set GitHub Secrets: `GCP_PROJECT_ID` and `GCP_SA_KEY`.
   - Push to `main` branch to trigger deployment via GitHub Actions.
   - Update `API_URL` in `index.html` to the Cloud Run URL.

## Notes
- Stay within Google Cloud free tier (1 TB BigQuery queries, 180,000 vCPU-seconds Cloud Run).
- Uses hardcoded email (`reachadeel@gmail.com`).
- Do not commit `service-account.json`.
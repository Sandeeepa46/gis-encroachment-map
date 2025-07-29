document.addEventListener('DOMContentLoaded', () => {
    const reportTitle = document.getElementById('report-title');
    const reportTableBody = document.getElementById('report-table-body');
    const searchInput = document.getElementById('search-input');

    let allReports = []; // To store all fetched reports for client-side searching

    // Function to render the table with a given set of reports
    const renderTable = (reports) => {
        reportTableBody.innerHTML = ''; // Clear existing data
        if (reports.length === 0) {
            reportTableBody.innerHTML = '<tr><td colspan="5">No reports match your search.</td></tr>';
            return;
        }

        reports.forEach(report => {
            const row = document.createElement('tr');
            row.className = 'report-row'; // Add class for styling and clicking
            // Store tank name in a data attribute for easy access on click
            row.dataset.tankName = report.tankName; 

            row.innerHTML = `
                <td>${report.tankName}</td>
                <td>${report.location}</td>
                <td>${report.encroachmentType}</td>
                <td>${new Date(report.observationDate).toLocaleDateString()}</td>
                <td>${report.description || ''}</td>
            `;
            reportTableBody.appendChild(row);
        });
    };

    // Function to fetch all reports from the server
    const fetchReports = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/encroachments');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            
            allReports = await response.json();
            reportTitle.textContent = 'All Submitted Reports';
            renderTable(allReports); // Render the full table initially

        } catch (error) {
            console.error('Error fetching reports:', error);
            reportTableBody.innerHTML = '<tr><td colspan="5">Failed to load reports.</td></tr>';
        }
    };

    // --- EVENT LISTENERS ---

    // 1. Search filter event
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredReports = allReports.filter(report => 
            report.tankName.toLowerCase().includes(searchTerm)
        );
        renderTable(filteredReports);
    });

    // 2. Click event for table rows to go to analysis page
    reportTableBody.addEventListener('click', (e) => {
        // Find the closest parent row
        const row = e.target.closest('.report-row');
        if (row && row.dataset.tankName) {
            const tankName = row.dataset.tankName;
            // Navigate to the analysis page for the clicked tank
            window.location.href = `analysis.html?tankName=${encodeURIComponent(tankName)}`;
        }
    });

    // Initial fetch of reports when the page loads
    fetchReports();
});
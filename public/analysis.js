document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const analysisTitle = document.getElementById('analysis-title');
    const totalReportsEl = document.getElementById('total-reports');
    const firstReportDateEl = document.getElementById('first-report-date');
    const lastReportDateEl = document.getElementById('last-report-date');
    const commonTypeEl = document.getElementById('common-type');
    const timeSeriesCanvas = document.getElementById('time-series-chart');
    const typeBreakdownCanvas = document.getElementById('type-breakdown-chart');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    // Global variables to hold data and chart instances
    let allReportsData = [];
    const chartObjects = {};

    // Get the tank name from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const tankName = urlParams.get('tankName');

    if (!tankName) {
        analysisTitle.textContent = "Error: No tank specified.";
        return;
    }

    analysisTitle.textContent = `Analysis Dashboard for: ${tankName}`;
    const apiUrl = `http://localhost:5000/api/encroachments?tankName=${encodeURIComponent(tankName)}`;

    // --- DATA PROCESSING & RENDERING FUNCTIONS ---

    const updateStatCards = (reports) => {
        if (reports.length === 0) return;

        // Sort reports by date to easily find first and last
        reports.sort((a, b) => new Date(a.observationDate) - new Date(b.observationDate));

        totalReportsEl.textContent = reports.length;
        firstReportDateEl.textContent = new Date(reports[0].observationDate).toLocaleDateString();
        lastReportDateEl.textContent = new Date(reports[reports.length - 1].observationDate).toLocaleDateString();

        // Find most common encroachment type
        const typeCounts = reports.reduce((acc, report) => {
            acc[report.encroachmentType] = (acc[report.encroachmentType] || 0) + 1;
            return acc;
        }, {});

        let maxCount = 0;
        let commonType = "N/A";
        for (const type in typeCounts) {
            if (typeCounts[type] > maxCount) {
                maxCount = typeCounts[type];
                commonType = type;
            }
        }
        commonTypeEl.textContent = commonType;
    };

    const renderTimeSeriesChart = (reports) => {
        // Group reports by date and count them
        const reportsByDate = reports.reduce((acc, report) => {
            const date = new Date(report.observationDate).toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        const sortedDates = Object.keys(reportsByDate).sort();
        const chartData = sortedDates.map(date => ({
            x: date,
            y: reportsByDate[date]
        }));

        if (chartObjects.timeSeries) chartObjects.timeSeries.destroy(); // Destroy old chart before drawing new

        chartObjects.timeSeries = new Chart(timeSeriesCanvas, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Number of Reports',
                    data: chartData,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    tension: 0.1, // Makes the line slightly curved
                    fill: true,
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'time',
                        time: { unit: 'day', tooltipFormat: 'MMM d, yyyy' },
                        title: { display: true, text: 'Date of Observation' }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 },
                        title: { display: true, text: 'Count' }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            title: (context) => new Date(context[0].parsed.x).toLocaleDateString(),
                            label: (context) => `${context.parsed.y} reports`
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    };

    const renderTypeBreakdownChart = (reports) => {
        const typeCounts = reports.reduce((acc, report) => {
            acc[report.encroachmentType] = (acc[report.encroachmentType] || 0) + 1;
            return acc;
        }, {});

        if (chartObjects.typeBreakdown) chartObjects.typeBreakdown.destroy();

        chartObjects.typeBreakdown = new Chart(typeBreakdownCanvas, {
            type: 'doughnut',
            data: {
                labels: Object.keys(typeCounts),
                datasets: [{
                    data: Object.values(typeCounts),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.parsed;
                                const sum = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / sum) * 100).toFixed(1) + '%';
                                return `${label}: ${value} (${percentage})`;
                            }
                        }
                    }
                }
            }
        });
    };

    const filterDataAndRedraw = () => {
        const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
        const endDate = endDateInput.value ? new Date(endDateInput.value) : null;

        const filteredReports = allReportsData.filter(report => {
            const reportDate = new Date(report.observationDate);
            if (startDate && reportDate < startDate) return false;
            if (endDate && reportDate > endDate) return false;
            return true;
        });
        
        // Re-render charts with filtered data
        renderTimeSeriesChart(filteredReports);
        renderTypeBreakdownChart(filteredReports);
    };

    // --- MAIN EXECUTION ---
    const fetchAndAnalyze = async () => {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Failed to fetch data');
            
            allReportsData = await response.json();
            
            if (allReportsData.length > 0) {
                updateStatCards(allReportsData);
                renderTimeSeriesChart(allReportsData);
                renderTypeBreakdownChart(allReportsData);
            } else {
                analysisTitle.textContent = `No reports found for ${tankName}`;
                document.querySelector('.stats-grid').style.display = 'none';
                document.querySelectorAll('.chart-card').forEach(c => c.style.display = 'none');
            }
        } catch (error) {
            console.error('Analysis Error:', error);
            analysisTitle.textContent = 'Could not load analysis data.';
        }
    };
    
    // Add event listeners for date filters
    startDateInput.addEventListener('change', filterDataAndRedraw);
    endDateInput.addEventListener('change', filterDataAndRedraw);

    fetchAndAnalyze();
});
document.addEventListener('DOMContentLoaded', () => {
    // --- MAP INITIALIZATION ---
    const map = L.map('map').setView([7.8731, 80.7718], 9); // Centered on Sri Lanka
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // --- UI ELEMENTS ---
    const formContainer = document.getElementById('form-container');
    const form = document.getElementById('encroachment-form');
    const cancelBtn = document.getElementById('cancel-btn');
    const showAllReportsBtn = document.getElementById('show-all-reports-btn');

    // --- LOAD GEOJSON DATA ---

    // 1. Load and display Province Boundary
    fetch('./data/NWP_Boundary.geojson')
        .then(res => res.json())
        .then(data => {
            L.geoJSON(data, {
                style: {
                    color: "#ff0000",
                    weight: 3,
                    opacity: 0.65
                }
            }).addTo(map);
            map.fitBounds(L.geoJSON(data).getBounds()); // Zoom to the province
        });

    // 2. Load and display Tanks
    fetch('./data/NWP_Tanks.geojson')
        .then(res => res.json())
        .then(data => {
            L.geoJSON(data, {
                onEachFeature: (feature, layer) => {
                    // Use the correct property name from your GeoJSON file
                    const tankName = feature.properties.hg_nm_hydr;

                    // Use the name for the tooltip, or a default text if it's null
                    const displayName = tankName || "Unnamed Tank";
                    layer.bindTooltip(displayName);

                    // Add a click event listener
                    layer.on('click', () => {
                        // Only show the form if the tank actually has a name
                        if (tankName) {
                            form.reset(); // Clear previous entries
                            document.getElementById('tankName').value = tankName; // Auto-fill tank name
                            formContainer.classList.remove('hidden'); // Show the form
                        } else {
                            // Optionally, inform the user if the tank has no name
                            alert("This tank does not have a name and cannot be reported.");
                        }
                    });
                }
            }).addTo(map);
        });

    // --- BUTTON AND FORM EVENT LISTENERS ---

    // Button to show ALL reports in the same window
    showAllReportsBtn.addEventListener('click', () => {
        window.location.href = 'reports.html';
    });

    // Hide form on cancel
    cancelBtn.addEventListener('click', () => {
        formContainer.classList.add('hidden');
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = {
            tankName: formData.get('tankName'),
            location: formData.get('location'),
            encroachmentType: formData.get('encroachmentType'),
            description: formData.get('description'),
            observationDate: formData.get('observationDate'),
        };

        try {
            const response = await fetch('http://localhost:5000/api/encroachments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to submit report');

            alert('Report submitted successfully!');
            formContainer.classList.add('hidden');
        } catch (error) {
            console.error('Submission Error:', error);
            alert(error.message);
        }
    });
});
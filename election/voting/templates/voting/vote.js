// Election Data with Student Admission Number System
const electionData = {
    positions: [
        {
            id: "president",
            title: "School President",
            candidates: [
                {
                    id: "alex-johnson",
                    name: "Boniface Kathu",
                    photo: "static/",
                    agenda: "Mental health support, sustainability, transparent budgeting"
                },
                {
                    id: "samuel-brown",
                    name: "sammy",
                    photo: "",
                    agenda: "School spirit, sports funding, cafeteria improvements"
                },
                {
                    id: "jessica-williams",
                    name: "Jessy",
                    photo: "",
                    agenda: "Technology upgrades, club funding, student discounts"
                }
            ]
        },
        {
            id: "secretary",
            title: "Secretary General",
            candidates: [
                {
                    id: "maria-rodriguez",
                    name: "precious",
                    photo: "fgr",
                    agenda: "Transparent communication, digital archives, mentorship"
                },
                {
                    id: "ryan-miller",
                    name: "Mulwa",
                    photo: "",
                    agenda: "Efficient meetings, better minutes, app development"
                }
            ]
        },
        {
            id: "education",
            title: "Cabinet Secretary for Education",
            candidates: [
                {
                    id: "david-chen",
                    name: "Mark Vundi",
                    photo: "static/Mark.jpg",
                    agenda: "Peer tutoring, digital resources, study skills workshops"
                },
                {
                    id: "sophia-kim",
                    name: "Kamani",
                    photo: "no idea",
                    agenda: "Curriculum diversity, exam support, teacher feedback"
                }
            ]
        }
    ],
    votes: {},
    isVotingActive: false,
    voters: {}, // Format: { "NUU001": { department: "Computer Science", votedAt: "2023-10-15T10:30:00" } }
    departmentVotes: {}, // Track votes per department
    adminCredentials: {
        username: "election2026",
        password: "admin123"
    },
    // Valid student admission numbers
    validStudents: ["NUU001", "NUU002", "NUU003", "NUU004", "NUU005"]
};

let lastVisitedSection = 'president'; // Track last visited section for admin panel

// Initialize voting data
function initializeVotingData() {
    // Check if votes exist in localStorage
    const savedVotes = localStorage.getItem('studentCouncilVotes');
    if (savedVotes) {
        electionData.votes = JSON.parse(savedVotes);
    } else {
        // Initialize votes
        electionData.positions.forEach(position => {
            electionData.votes[position.id] = {};
            position.candidates.forEach(candidate => {
                electionData.votes[position.id][candidate.id] = 0;
            });
        });
        saveVotesToStorage();
    }// Updated JavaScript for Django backend
async function initializeVotingData() {
    try {
        // Fetch positions from Django
        const positionsResponse = await fetch('/api/positions/');
        const positionsData = await positionsResponse.json();
        
        // Fetch settings
        const settingsResponse = await fetch('/api/settings/');
        const settingsData = await settingsResponse.json();
        
        // Update electionData with server data
        electionData.positions = positionsData.positions;
        electionData.isVotingActive = settingsData.is_voting_active;
        
        // Initialize votes object
        electionData.votes = {};
        electionData.positions.forEach(position => {
            electionData.votes[position.id] = {};
            position.candidates.forEach(candidate => {
                electionData.votes[position.id][candidate.id] = 0;
            });
        });
        
        // Update UI
        updateVotingUI();
        renderVotingCandidates();
        renderAllCandidatesPage();
        
        // Fetch and display results
        await updateStatistics();
        
    } catch (error) {
        console.error('Error initializing data:', error);
    }
}
    
    // Check if voters exist in localStorage
    const savedVoters = localStorage.getItem('studentCouncilVoters');
    if (savedVoters) {
        electionData.voters = JSON.parse(savedVoters);
    }
    
    // Check if department votes exist
    const savedDeptVotes = localStorage.getItem('studentCouncilDeptVotes');
    if (savedDeptVotes) {
        electionData.departmentVotes = JSON.parse(savedDeptVotes);
    } else {
        electionData.departmentVotes = {};
    }
    
    // Check voting status
    const votingStatus = localStorage.getItem('studentCouncilVotingStatus');
    electionData.isVotingActive = votingStatus === 'active';
    
    updateVotingUI();
    renderVotingCandidates();
    renderAllCandidatesPage();
    updateStatistics();
}

// Save votes to localStorage
function saveVotesToStorage() {
    localStorage.setItem('studentCouncilVotes', JSON.stringify(electionData.votes));
    localStorage.setItem('studentCouncilVoters', JSON.stringify(electionData.voters));
    localStorage.setItem('studentCouncilDeptVotes', JSON.stringify(electionData.departmentVotes));
}

// Save voting status
function saveVotingStatus() {
    localStorage.setItem('studentCouncilVotingStatus', electionData.isVotingActive ? 'active' : 'inactive');
}

// Update voting UI based on status
function updateVotingUI() {
    const statusIndicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('voting-status-text');
    const voteContainer = document.getElementById('vote-container');
    const closedMessage = document.getElementById('closed-voting-message');
    
    if (electionData.isVotingActive) {
        statusIndicator.className = 'status-indicator active';
        statusText.textContent = 'ACTIVE';
        statusText.style.color = '#27ae60';
        voteContainer.classList.add('active');
        closedMessage.style.display = 'none';
    } else {
        statusIndicator.className = 'status-indicator';
        statusText.textContent = 'CLOSED';
        statusText.style.color = '#e74c3c';
        voteContainer.classList.remove('active');
        closedMessage.style.display = 'block';
    }
}

// Render voting candidates
function renderVotingCandidates() {
    electionData.positions.forEach(position => {
        const container = document.getElementById(`${position.id}-candidates`);
        if (!container) return;
        
        container.innerHTML = '';
        
        position.candidates.forEach(candidate => {
            const candidateElement = document.createElement('div');
            candidateElement.className = 'candidate-option';
            candidateElement.innerHTML = `
                <input type="radio" name="${position.id}" value="${candidate.id}" id="${candidate.id}">
                <div class="candidate-vote-info">
                    <img src="${candidate.photo}" alt="${candidate.name}" class="candidate-vote-photo">
                    <div>
                        <div class="candidate-vote-name">${candidate.name}</div>
                        <div class="candidate-vote-agenda">${candidate.agenda}</div>
                    </div>
                </div>
            `;
            
            // Add click event to select candidate
            candidateElement.addEventListener('click', function() {
                const radioInput = this.querySelector('input[type="radio"]');
                radioInput.checked = true;
                
                // Remove selected class from all candidates in this position
                const allCandidates = container.querySelectorAll('.candidate-option');
                allCandidates.forEach(c => c.classList.remove('selected'));
                
                // Add selected class to clicked candidate
                this.classList.add('selected');
                
                validateVote();
            });
            
            container.appendChild(candidateElement);
        });
    });
}

// Render all candidates page
function renderAllCandidatesPage() {
    const container = document.getElementById('all-candidates-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    electionData.positions.forEach(position => {
        position.candidates.forEach(candidate => {
            const candidateCard = document.createElement('div');
            candidateCard.className = 'candidate-card';
            candidateCard.innerHTML = `
                <img src="${candidate.photo}" alt="${candidate.name}" class="card-photo">
                <div class="card-info">
                    <h3>${candidate.name}</h3>
                    <p class="candidate-position">${position.title}</p>
                    <p>${candidate.agenda}</p>
                </div>
            `;
            container.appendChild(candidateCard);
        });
    });
}

// Validate vote (check if all positions have a selection)
function validateVote() {
    let allSelected = true;
    const validationMsg = document.getElementById('vote-validation');
    const submitBtn = document.getElementById('submit-vote-btn');
    
    electionData.positions.forEach(position => {
        const selected = document.querySelector(`input[name="${position.id}"]:checked`);
        if (!selected) {
            allSelected = false;
        }
    });
    
    if (allSelected) {
        validationMsg.textContent = '';
        validationMsg.style.color = '#27ae60';
        submitBtn.disabled = false;
    } else {
        validationMsg.textContent = 'Please select a candidate for each position.';
        validationMsg.style.color = '#e74c3c';
        submitBtn.disabled = true;
    }
    
    return allSelected;
}

// Open voter authentication modal
function authenticateVoter() {
    if (!validateVote()) {
        alert('Please select a candidate for each position before voting.');
        return;
    }
    
    if (!electionData.isVotingActive) {
        alert('Voting is currently closed. Please wait for the voting period to begin.');
        return;
    }
    
    document.getElementById('auth-modal').style.display = 'flex';
    document.getElementById('admission-number').value = '';
    document.getElementById('department').selectedIndex = 0;
    document.getElementById('auth-error').style.display = 'none';
}

// Close auth modal
function closeAuthModal() {
    document.getElementById('auth-modal').style.display = 'none';
}

// Verify voter using admission number
function verifyVoter() {
    const admissionInput = document.getElementById('admission-number').value.trim().toUpperCase();
    const department = document.getElementById('department').value;
    const errorDiv = document.getElementById('auth-error');
    const errorText = document.getElementById('error-text');
    
    // Check if admission number is entered
    if (admissionInput === '') {
        errorText.textContent = 'Please enter your admission number.';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Check if department is selected
    if (!department) {
        errorText.textContent = 'Please select your department.';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Check if admission number is valid
    if (!electionData.validStudents.includes(admissionInput)) {
        errorText.textContent = 'Admission number not recognized.';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Check if this admission number has already voted
    if (electionData.voters[admissionInput]) {
        errorText.textContent = 'This admission number has already voted.';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Record vote
    recordVote(admissionInput, department);
    closeAuthModal();
    showVoteConfirmation(admissionInput);
}

// Record the vote
function recordVote(voterID, department) {
    // Mark voter as voted with department info
    electionData.voters[voterID] = {
        department: department,
        votedAt: new Date().toISOString()
    };
    
    // Update department vote count
    if (!electionData.departmentVotes[department]) {
        electionData.departmentVotes[department] = 0;
    }
    electionData.departmentVotes[department] += 1;
    
    // Record votes for each position
    electionData.positions.forEach(position => {
        const selectedCandidate = document.querySelector(`input[name="${position.id}"]:checked`);
        if (selectedCandidate) {
            electionData.votes[position.id][selectedCandidate.value] += 1;
        }
    });
    
    // Save to storage
    saveVotesToStorage();
    
    // Clear selections
    document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
        radio.checked = false;
        radio.closest('.candidate-option').classList.remove('selected');
    });
    
    // Update validation
    validateVote();
    
    // Update statistics
    updateStatistics();
}

// Show vote confirmation
function showVoteConfirmation(voterID) {
    // Build vote summary
    let summaryHTML = '';
    electionData.positions.forEach(position => {
        const selectedCandidate = document.querySelector(`input[name="${position.id}"]:checked`);
        if (selectedCandidate) {
            const candidateId = selectedCandidate.value;
            const candidate = position.candidates.find(c => c.id === candidateId);
            summaryHTML += `<p><strong>${position.title}:</strong> ${candidate.name}</p>`;
        }
    });
    
    document.getElementById('vote-summary').innerHTML = summaryHTML;
    document.getElementById('confirmed-voter-id').textContent = voterID;
    document.getElementById('confirmation-modal').style.display = 'flex';
}

// Close confirmation modal
function closeConfirmationModal() {
    document.getElementById('confirmation-modal').style.display = 'none';
}

// Update statistics dashboard
function updateStatistics() {
    const statsContainer = document.getElementById('stats-dashboard');
    const deptContainer = document.getElementById('department-breakdown-list');
    
    if (!statsContainer || !deptContainer) return;
    
    // Calculate total votes
    let totalVotes = Object.keys(electionData.voters).length;
    
    // Calculate votes per position
    let presidentVotes = 0;
    let secretaryVotes = 0;
    let educationVotes = 0;
    
    if (electionData.votes.president) {
        presidentVotes = Object.values(electionData.votes.president).reduce((a, b) => a + b, 0);
    }
    if (electionData.votes.secretary) {
        secretaryVotes = Object.values(electionData.votes.secretary).reduce((a, b) => a + b, 0);
    }
    if (electionData.votes.education) {
        educationVotes = Object.values(electionData.votes.education).reduce((a, b) => a + b, 0);
    }
    
    // Update stats dashboard
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${totalVotes}</div>
            <div class="stat-label">Total Votes Cast</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${presidentVotes}</div>
            <div class="stat-label">President Votes</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${secretaryVotes}</div>
            <div class="stat-label">Secretary Votes</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${educationVotes}</div>
            <div class="stat-label">Education Votes</div>
        </div>
    `;
    
    // Update department breakdown
    let deptHTML = '';
    const departments = [
        "Automotive Engineering", "Agriculture Extensions", "Building and Construction", "Beauty and Hairdressing",
        "Callinery Arts", "Computing and Informatics", "Electrical Engineering", "Fashion and Design",
        "Business and secretarial studies", "Human Resource Management", "Other"
    ];
    
    departments.forEach(dept => {
        const count = electionData.departmentVotes[dept] || 0;
        if (count > 0) {
            deptHTML += `
                <div class="department-row">
                    <span class="department-name">${dept}</span>
                    <span class="department-count">${count} vote${count !== 1 ? 's' : ''}</span>
                </div>
            `;
        }
    });
    
    // If no departments have voted yet
    if (deptHTML === '') {
        deptHTML = '<p style="text-align: center; color: #7f8c8d;">No votes recorded yet.</p>';
    }
    
    deptContainer.innerHTML = deptHTML;
}

// Refresh statistics
function refreshStats() {
    updateStatistics();
    alert('Statistics refreshed!');
}

// Admin functions
function showAdminLogin() {
    // Save the current visible section before login
    const sections = document.querySelectorAll(".content-section");
    sections.forEach(s => {
        if (s.style.display === "block") {
            lastVisitedSection = s.id.replace("-section", "");
        }
    });

    // Show the admin login modal
    document.getElementById("admin-modal").style.display = "block";
}

function closeAdminModal() {
    document.getElementById('admin-modal').style.display = 'none';
    document.getElementById('admin-error').style.display = 'none';
    document.getElementById('admin-username').value = '';
    document.getElementById('admin-password').value = '';
}

function exitAdminPanel() {
    document.getElementById("admin-panel").style.display = "none";
    document.getElementById("admin-modal").style.display = "none";
    
    // Show the last visited section again
    showSection(lastVisitedSection);
}

function verifyAdmin() {
    const username = document.getElementById("admin-username").value.trim();
    const password = document.getElementById("admin-password").value.trim();
    const adminError = document.getElementById("admin-error");

    if (username === electionData.adminCredentials.username && password === electionData.adminCredentials.password) {
        adminError.style.display = "none";
        
        // Hide login modal
        document.getElementById("admin-modal").style.display = "none";
        
        // Show admin panel
        const adminPanel = document.getElementById("admin-panel");
        adminPanel.style.display = "block";
        
        // Hide other sections to avoid overlap
        const sections = document.querySelectorAll(".content-section");
        sections.forEach(s => s.style.display = "none");
        
        // Scroll to top of admin panel
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        adminError.style.display = "block";
    }
}

function openVoting() {
    electionData.isVotingActive = true;
    saveVotingStatus();
    updateVotingUI();
    alert('Voting is now OPEN!');
}

function pauseVoting() {
    electionData.isVotingActive = false;
    saveVotingStatus();
    updateVotingUI();
    alert('Voting has been PAUSED. No new votes can be cast.');
}

function closeVoting() {
    if (confirm('Are you sure you want to END the voting? This cannot be undone.')) {
        electionData.isVotingActive = false;
        saveVotingStatus();
        updateVotingUI();
        alert('Voting is now CLOSED. No more votes can be cast.');
    }
}

function viewResults() {
    // Build results table
    let resultsHTML = '';
    
    electionData.positions.forEach(position => {
        resultsHTML += `<h3>${position.title}</h3>`;
        resultsHTML += `<table class="results-table">`;
        resultsHTML += `<thead><tr><th>Candidate</th><th>Votes</th><th>Percentage</th></tr></thead>`;
        resultsHTML += `<tbody>`;
        
        // Calculate total votes for this position
        let totalVotes = 0;
        position.candidates.forEach(candidate => {
            totalVotes += electionData.votes[position.id][candidate.id] || 0;
        });
        
        // Add each candidate's results
        position.candidates.forEach(candidate => {
            const votes = electionData.votes[position.id][candidate.id] || 0;
            const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0;
            
            resultsHTML += `<tr>`;
            resultsHTML += `<td>${candidate.name}</td>`;
            resultsHTML += `<td class="vote-count">${votes}</td>`;
            resultsHTML += `<td>${percentage}% <div class="vote-progress-bar"><div class="vote-progress" style="width: ${percentage}%"></div></div></td>`;
            resultsHTML += `</tr>`;
        });
        
        resultsHTML += `</tbody></table>`;
        resultsHTML += `<p style="margin-top: 0.5rem; color: #7f8c8d;">Total votes for this position: ${totalVotes}</p>`;
        resultsHTML += `<hr style="margin: 1.5rem 0;">`;
    });
    
    // Add overall stats
    let totalVotesAll = Object.keys(electionData.voters).length;
    
    resultsHTML += `<div style="background-color: #f8f9fa; padding: 1rem; border-radius: 8px; margin-top: 1rem;">`;
    resultsHTML += `<h4>Overall Statistics</h4>`;
    resultsHTML += `<p>Total votes cast: <strong>${totalVotesAll}</strong></p>`;
    resultsHTML += `<p>Voting status: <strong>${electionData.isVotingActive ? 'ACTIVE' : 'CLOSED'}</strong></p>`;
    
    // Add department breakdown summary
    let topDepartments = Object.entries(electionData.departmentVotes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
    
    if (topDepartments.length > 0) {
        resultsHTML += `<p>Top voting departments: `;
        topDepartments.forEach(([dept, count], index) => {
            resultsHTML += `<strong>${dept}</strong> (${count})`;
            if (index < topDepartments.length - 1) resultsHTML += ', ';
        });
        resultsHTML += `</p>`;
    }
    
    resultsHTML += `</div>`;
    
    document.getElementById('results-panel').innerHTML = resultsHTML;
    document.getElementById('results-modal').style.display = 'flex';
}

function closeResultsModal() {
    document.getElementById('results-modal').style.display = 'none';
}

function exportResults() {
    // Create a downloadable file with results
    let resultsText = "STUDENT COUNCIL ELECTION RESULTS\n";
    resultsText += "===============================\n\n";
    resultsText += `Generated on: ${new Date().toLocaleString()}\n`;
    resultsText += `Total voters: ${Object.keys(electionData.voters).length}\n\n`;
    
    electionData.positions.forEach(position => {
        resultsText += `${position.title}\n`;
        resultsText += "--------------------------------\n";
        
        // Calculate total votes for this position
        let totalVotes = 0;
        position.candidates.forEach(candidate => {
            totalVotes += electionData.votes[position.id][candidate.id] || 0;
        });
        
        position.candidates.forEach(candidate => {
            const votes = electionData.votes[position.id][candidate.id] || 0;
            const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0;
            
            resultsText += `${candidate.name}: ${votes} votes (${percentage}%)\n`;
        });
        
        resultsText += `Total: ${totalVotes} votes\n\n`;
    });
    
    // Add department breakdown
    resultsText += `DEPARTMENT VOTING BREAKDOWN\n`;
    resultsText += "--------------------------------\n";
    Object.entries(electionData.departmentVotes)
        .sort((a, b) => b[1] - a[1])
        .forEach(([dept, count]) => {
            resultsText += `${dept}: ${count} vote${count !== 1 ? 's' : ''}\n`;
        });
    
    // Create blob and download link
    const blob = new Blob([resultsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `election_results_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Results exported successfully!');
}

function resetVotes() {
    if (confirm('WARNING: This will reset ALL votes, voter records, and the ID counter. Are you sure?')) {
        // Reset votes
        electionData.positions.forEach(position => {
            electionData.votes[position.id] = {};
            position.candidates.forEach(candidate => {
                electionData.votes[position.id][candidate.id] = 0;
            });
        });
        
        // Reset voters
        electionData.voters = {};
        
        // Reset department votes
        electionData.departmentVotes = {};
        
        // Save to storage
        saveVotesToStorage();
        
        // Update statistics
        updateStatistics();
        
        alert('All votes and voter records have been reset.');
        viewResults(); // Refresh results view
    }
}

// Navigation function
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show the selected section
    document.getElementById(`${sectionId}-section`).style.display = 'block';
    
    // Update active nav link
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Find and activate the clicked nav link
    document.querySelectorAll('nav a').forEach(link => {
        if (link.textContent.includes(sectionId.replace('-', ' ')) || 
           (sectionId === 'president' && link.textContent.includes('President')) ||
           (sectionId === 'voting' && link.textContent.includes('Voting')) ||
           (sectionId === 'feedback' && link.textContent.includes('Voice')) ||
           (sectionId === 'stats' && link.textContent.includes('Statistics'))) {
            link.classList.add('active');
        }
    });
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Update statistics if viewing stats page
    if (sectionId === 'stats') {
        updateStatistics();
    }
}

// Countdown timer for voting
function startCountdown() {
    // Set election date (October 15, 2023)
    const electionDate = new Date('October 15, 2023 08:00:00').getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = electionDate - now;
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Display the countdown
        const countdownElement = document.getElementById('countdown');
        if (countdownElement) {
            if (distance < 0) {
                countdownElement.innerHTML = "Voting is now open!";
            } else {
                countdownElement.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
            }
        }
        
        // Update election date display
        const electionTimer = document.getElementById('election-timer');
        if (electionTimer) {
            if (distance < 0) {
                electionTimer.innerHTML = "Election: Voting Now Open!";
                electionTimer.style.backgroundColor = "#27ae60";
            } else if (distance < 86400000) { // Less than 24 hours
                electionTimer.innerHTML = "Election: Voting Opens Tomorrow!";
                electionTimer.style.backgroundColor = "#f39c12";
            }
        }
    }
    
    // Update countdown every second
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Feedback submission
function submitFeedback() {
    const department = document.getElementById('feedback-dept').value;
    const feedback = document.getElementById('feedback').value;
    
    if (!department) {
        alert('Please select a department.');
        return;
    }
    
    if (!feedback.trim()) {
        alert('Please enter your feedback.');
        return;
    }
    
    // Show confirmation message
    document.getElementById('confirmation-message').style.display = 'block';
    
    // Clear form
    document.getElementById('feedback-dept').value = '';
    document.getElementById('feedback').value = '';
    
    // Scroll to confirmation
    document.getElementById('confirmation-message').scrollIntoView({ behavior: 'smooth' });
    
    // Hide confirmation after 5 seconds
    setTimeout(() => {
        document.getElementById('confirmation-message').style.display = 'none';
    }, 5000);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    showSection('president');
    initializeVotingData();
    startCountdown();
});
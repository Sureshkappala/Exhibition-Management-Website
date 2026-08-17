/* ==========================================================================
   DISASTER RELIEF FOUNDATION - Dashboard Interaction & Dynamic Charts
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initDashboardTabs();
    initMobileSidebar();
    initInteractiveControls();
    renderCharts();
    initUserProfile();
});

/**
 * 1. Sidebar Tab Switching (renders panels dynamically)
 */
function initDashboardTabs() {
    const sidebarItems = document.querySelectorAll('.sidebar-item[data-tab]');
    const tabPanels = document.querySelectorAll('.dashboard-panel');
    
    if (sidebarItems.length === 0) return;
    
    sidebarItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all items
            sidebarItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            item.classList.add('active');
            
            // Hide all panels
            tabPanels.forEach(panel => {
                panel.style.display = 'none';
            });
            
            // Show target panel
            const targetTab = item.getAttribute('data-tab');
            const targetPanel = document.getElementById(`panel-${targetTab}`);
            if (targetPanel) {
                targetPanel.style.display = 'block';
                // Trigger chart re-render if it becomes visible (helps SVG bounds rendering)
                if (targetTab === 'overview' || targetTab === 'analytics') {
                    setTimeout(renderCharts, 50);
                }
            }
        });
    });

    // Check for target tab in URL parameters or hash on load
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab') || window.location.hash.substring(1);
    if (tabParam) {
        const targetBtn = document.querySelector(`.sidebar-item[data-tab="${tabParam}"]`);
        if (targetBtn) {
            targetBtn.click();
        }
    }
}

/**
 * 2. Simulate Admin controls (Volunteer Approvals, Messages, Settings)
 */
function initInteractiveControls() {
    // Approve Volunteer Action
    const approveBtns = document.querySelectorAll('.btn-approve-volunteer');
    approveBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const row = btn.closest('tr');
            const statusBadge = row.querySelector('.status-badge');
            if (statusBadge) {
                statusBadge.textContent = 'Approved';
                statusBadge.className = 'status-badge success';
            }
            btn.disabled = true;
            btn.textContent = 'Approved';
            btn.style.backgroundColor = 'var(--color-success)';
            btn.style.borderColor = 'var(--color-success)';
            btn.style.color = 'white';
            
            // Incremet Active Volunteers count in dashboard header dynamically
            const activeVolCounter = document.getElementById('count-active-volunteers');
            if (activeVolCounter) {
                let currentVal = parseInt(activeVolCounter.textContent.replace(/,/g, ''));
                activeVolCounter.textContent = (currentVal + 1).toLocaleString();
            }
            
            showToast("Volunteer Approved Successfully!");
        });
    });

    // Edit Program Status slider / inputs
    const progressSliders = document.querySelectorAll('.program-progress-slider');
    progressSliders.forEach(slider => {
        slider.addEventListener('change', (e) => {
            const container = slider.closest('.program-control-item');
            const progressVal = container.querySelector('.progress-percentage');
            if (progressVal) {
                progressVal.textContent = slider.value + '%';
            }
            showToast(`Program Target Updated to ${slider.value}%`);
        });
    });

    // Reply to Contact Messages
    const replyBtns = document.querySelectorAll('.btn-reply-message');
    replyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const row = btn.closest('tr');
            const senderEmail = row.cells[1].textContent;
            const originalMsg = row.cells[2].textContent;
            
            // Open modal
            openReplyModal(senderEmail, originalMsg, row);
        });
    });
    
    // Save settings form
    const settingsForm = document.getElementById('dashboard-settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast("Settings Updated Successfully!");
        });
    }
}

/**
 * 3. Render Responsive SVG Line/Bar Charts
 */
function renderCharts() {
    // 3.1 Total Donations Trend Chart (Line Chart)
    const donationsChart = document.getElementById('svg-donations-chart');
    if (donationsChart) {
        // Clear previous path
        donationsChart.innerHTML = '';
        
        // Mock dataset (Months, Donations in Thousands USD)
        const data = [
            { x: 0, y: 15, label: 'Jan' },
            { x: 1, y: 22, label: 'Feb' },
            { x: 2, y: 48, label: 'Mar' }, // Spike due to Spring Floods relief
            { x: 3, y: 35, label: 'Apr' },
            { x: 4, y: 55, label: 'May' },
            { x: 5, y: 70, label: 'Jun' }, // Spike due to Cyclone response
            { x: 6, y: 64, label: 'Jul' }
        ];
        
        drawSVGLineChart(donationsChart, data, '$', 'k');
    }
    
    // 3.2 Individual User Contribution Trend Chart
    const userDonationsChart = document.getElementById('svg-user-donations-chart');
    if (userDonationsChart) {
        userDonationsChart.innerHTML = '';
        const userData = [
            { x: 0, y: 50, label: 'Feb' },
            { x: 1, y: 150, label: 'Mar' },
            { x: 2, y: 100, label: 'Apr' },
            { x: 3, y: 0, label: 'May' },
            { x: 4, y: 250, label: 'Jun' },
            { x: 5, y: 120, label: 'Jul' }
        ];
        drawSVGLineChart(userDonationsChart, userData, '$', '');
    }
}

/**
 * Line Chart Drawing engine
 */
function drawSVGLineChart(svg, data, prefix = '', suffix = '') {
    const width = svg.clientWidth || 550;
    const height = svg.clientHeight || 250;
    
    const padding = { top: 30, right: 30, bottom: 40, left: 50 };
    
    // Find min / max values
    const yValues = data.map(d => d.y);
    const maxY = Math.max(...yValues, 100) * 1.15; // Give extra spacing on top
    const minY = 0;
    
    const countX = data.length - 1;
    
    // Scalers
    const scaleX = (index) => padding.left + (index / countX) * (width - padding.left - padding.right);
    const scaleY = (val) => height - padding.bottom - ((val - minY) / (maxY - minY)) * (height - padding.top - padding.bottom);
    
    // Create elements namespaces
    const svgNS = "http://www.w3.org/2000/svg";
    
    // Create linear gradient definition
    const defs = document.createElementNS(svgNS, 'defs');
    defs.innerHTML = `
        <linearGradient id="gradient-chart-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--color-secondary)" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="var(--color-secondary)" stop-opacity="0"/>
        </linearGradient>
    `;
    svg.appendChild(defs);
    
    // Grid Lines & Y Labels
    const gridCount = 4;
    for (let i = 0; i <= gridCount; i++) {
        const val = minY + (i / gridCount) * (maxY - minY);
        const y = scaleY(val);
        
        // Grid Line
        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', padding.left);
        line.setAttribute('y1', y);
        line.setAttribute('x2', width - padding.right);
        line.setAttribute('y2', y);
        line.setAttribute('class', 'svg-chart-grid');
        svg.appendChild(line);
        
        // Label
        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', padding.left - 12);
        text.setAttribute('y', y + 4);
        text.setAttribute('text-anchor', 'end');
        text.setAttribute('fill', 'var(--color-text-muted)');
        text.setAttribute('font-size', '11px');
        text.setAttribute('font-weight', '500');
        text.textContent = `${prefix}${Math.round(val)}${suffix}`;
        svg.appendChild(text);
    }
    
    // X Labels & Axis Line
    const axisY = scaleY(0);
    const axisLine = document.createElementNS(svgNS, 'line');
    axisLine.setAttribute('x1', padding.left);
    axisLine.setAttribute('y1', axisY);
    axisLine.setAttribute('x2', width - padding.right);
    axisLine.setAttribute('y2', axisY);
    axisLine.setAttribute('class', 'svg-chart-axis');
    svg.appendChild(axisLine);
    
    data.forEach((d, idx) => {
        const x = scaleX(idx);
        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', height - 12);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', 'var(--color-text-muted)');
        text.setAttribute('font-size', '11px');
        text.setAttribute('font-weight', '500');
        text.textContent = d.label;
        svg.appendChild(text);
    });
    
    // Generate line points and area points
    let points = [];
    data.forEach((d, idx) => {
        points.push(`${scaleX(idx)},${scaleY(d.y)}`);
    });
    
    const pointsStr = points.join(' ');
    
    // Draw area under line
    const area = document.createElementNS(svgNS, 'polygon');
    const areaPoints = `${padding.left},${axisY} ${pointsStr} ${scaleX(data.length - 1)},${axisY}`;
    area.setAttribute('points', areaPoints);
    area.setAttribute('class', 'svg-chart-area');
    svg.appendChild(area);
    
    // Draw Line
    const path = document.createElementNS(svgNS, 'polyline');
    path.setAttribute('points', pointsStr);
    path.setAttribute('class', 'svg-chart-line');
    svg.appendChild(path);
    
    // Draw Interaction Circles & Tooltips
    data.forEach((d, idx) => {
        const cx = scaleX(idx);
        const cy = scaleY(d.y);
        
        const circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', '5');
        circle.setAttribute('class', 'svg-chart-point');
        
        // Show tooltip on hover
        circle.addEventListener('mouseenter', (e) => {
            showChartTooltip(svg, cx, cy - 12, `${prefix}${d.y}${suffix}`);
        });
        circle.addEventListener('mouseleave', () => {
            hideChartTooltip(svg);
        });
        
        svg.appendChild(circle);
    });
}

/**
 * Chart Tooltip UI
 */
function showChartTooltip(svg, x, y, textVal) {
    hideChartTooltip(svg);
    const svgNS = "http://www.w3.org/2000/svg";
    
    const group = document.createElementNS(svgNS, 'g');
    group.setAttribute('id', 'chart-tooltip-group');
    
    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', x - 35);
    rect.setAttribute('y', y - 24);
    rect.setAttribute('width', '70');
    rect.setAttribute('height', '24');
    rect.setAttribute('fill', 'var(--color-primary)');
    rect.setAttribute('rx', '4');
    
    const text = document.createElementNS(svgNS, 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y - 8);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'var(--color-bg-white)');
    text.setAttribute('font-size', '11px');
    text.setAttribute('font-weight', '600');
    text.textContent = textVal;
    
    group.appendChild(rect);
    group.appendChild(text);
    svg.appendChild(group);
}

function hideChartTooltip(svg) {
    const tooltip = svg.querySelector('#chart-tooltip-group');
    if (tooltip) {
        svg.removeChild(tooltip);
    }
}

/**
 * Message Reply Modal Panel
 */
function openReplyModal(email, originalMsg, tableRow) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(10, 25, 47, 0.8)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';
    overlay.style.backdropFilter = 'blur(5px)';
    
    const modal = document.createElement('div');
    modal.className = 'form-card';
    modal.style.maxWidth = '550px';
    modal.style.width = '90%';
    
    modal.innerHTML = `
        <h3 class="form-title" style="margin-bottom: 8px;">Reply to Inquirer</h3>
        <p style="font-size: 0.9rem; color: var(--color-text-muted); margin-bottom: 20px;">
            To: <strong>${email}</strong>
        </p>
        <div style="background-color: var(--color-bg-light); border-left: 4px solid var(--color-secondary); padding: 12px; margin-bottom: 20px; font-size: 0.85rem; font-style: italic; color: var(--color-text-dark); border-radius: 0 var(--radius-sm) var(--radius-sm) 0;">
            "${originalMsg}"
        </div>
        <form id="admin-reply-inner-form">
            <div class="form-group">
                <label class="form-label" for="reply-text">Your Response</label>
                <textarea id="reply-text" class="form-control" rows="5" required placeholder="Type your relief coordinates or support response here..."></textarea>
            </div>
            <div style="display: flex; gap: 15px; justify-content: flex-end; margin-top: 25px;">
                <button type="button" id="btn-cancel-reply" class="btn btn-secondary btn-sm" style="padding: 10px 20px;">Cancel</button>
                <button type="submit" class="btn btn-primary btn-sm" style="padding: 10px 20px;">Send Reply</button>
            </div>
        </form>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    const cancelBtn = modal.querySelector('#btn-cancel-reply');
    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
    
    const innerForm = modal.querySelector('#admin-reply-inner-form');
    innerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Remove the message row or update status
        const statusBadge = tableRow.querySelector('.status-badge');
        if (statusBadge) {
            statusBadge.textContent = 'Replied';
            statusBadge.className = 'status-badge success';
        }
        
        const actionBtn = tableRow.querySelector('.btn-reply-message');
        if (actionBtn) {
            actionBtn.disabled = true;
            actionBtn.textContent = 'Replied';
            actionBtn.style.backgroundColor = 'transparent';
            actionBtn.style.color = 'var(--color-text-muted)';
            actionBtn.style.border = 'none';
        }
        
        document.body.removeChild(overlay);
        showToast(`Reply transmitted successfully to ${email}`);
    });
}

/**
 * Toast notification popup helper
 */
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '30px';
    toast.style.right = '30px';
    toast.style.backgroundColor = 'var(--color-primary)';
    toast.style.color = 'var(--color-bg-white)';
    toast.style.padding = '14px 24px';
    toast.style.borderRadius = 'var(--radius-md)';
    toast.style.boxShadow = 'var(--shadow-lg)';
    toast.style.zIndex = '99999';
    toast.style.fontSize = '0.9rem';
    toast.style.fontWeight = '600';
    toast.style.borderLeft = '4px solid var(--color-success)';
    toast.style.transform = 'translateY(100px)';
    toast.style.opacity = '0';
    toast.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    }, 50);
    
    // Fade out and remove
    setTimeout(() => {
        toast.style.transform = 'translateY(30px)';
        toast.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 400);
    }, 3500);
}

/**
 * 4. Mobile Dashboard Sidebar Drawer Navigation
 */
function initMobileSidebar() {
    const sidebarToggle = document.querySelector('.mobile-sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarClose = document.querySelector('.sidebar-close-btn');
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const mobileTitle = document.querySelector('.mobile-brand-title');
    
    if (!sidebar) return;
    
    // Open drawer
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.add('is-active');
            document.documentElement.classList.add('overflow-hidden');
            document.body.classList.add('overflow-hidden');
        });
    }
    
    // Close drawer via Close button
    if (sidebarClose) {
        sidebarClose.addEventListener('click', () => {
            sidebar.classList.remove('is-active');
            document.documentElement.classList.remove('overflow-hidden');
            document.body.classList.remove('overflow-hidden');
        });
    }
    
    // Mapping of tab names to header titles
    const tabTitleMap = {
        'overview': sidebar.querySelector('.sidebar-item[data-tab="overview"] span')?.textContent || 'Overview',
        'volunteers': 'Bucket Clusters',
        'donations': 'API Tokens',
        'volunteering': 'Evacuation Help',
        'portal': 'Relief Console'
    };
    
    // Close drawer when sidebar items are clicked
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            // Close menu on mobile
            if (window.innerWidth <= 992) {
                sidebar.classList.remove('is-active');
                document.documentElement.classList.remove('overflow-hidden');
                document.body.classList.remove('overflow-hidden');
            }
            
            // Dynamically update mobile header title
            const targetTab = item.getAttribute('data-tab');
            if (mobileTitle && targetTab && tabTitleMap[targetTab]) {
                mobileTitle.textContent = tabTitleMap[targetTab];
            }
        });
    });
    
    // Close drawer when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 992 && 
            sidebar.classList.contains('is-active') && 
            !sidebar.contains(e.target) && 
            (!sidebarToggle || !sidebarToggle.contains(e.target))) {
            
            sidebar.classList.remove('is-active');
            document.documentElement.classList.remove('overflow-hidden');
            document.body.classList.remove('overflow-hidden');
        }
    });

    // Redirect all mock dashboard action buttons to 404 page
    const dashboardButtons = document.querySelectorAll('button:not(.sidebar-close-btn):not(.mobile-sidebar-toggle):not(.password-toggle-icon)');
    dashboardButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = '404.html';
        });
    });
}

/**
 * 5. Dynamic User Profile Loader & Custom Logout Handler
 */
function initUserProfile() {
    const userEmail = localStorage.getItem('currentUserEmail') || 'kappalasuresh92@gmail.com';
    const userName = localStorage.getItem('currentUserName') || 'Suresh Kappala';
    
    // 1. Update sidebar profile email
    const profileEmailEl = document.querySelector('.sidebar-profile span:first-of-type');
    if (profileEmailEl) {
        profileEmailEl.textContent = userEmail;
    }
    
    // 2. Update sidebar profile display name / welcome credential text
    const profileRoleEl = document.querySelector('.sidebar-profile span:last-of-type');
    if (profileRoleEl) {
        const currentRole = profileRoleEl.textContent;
        // Keep EOC Administrator or Volunteer & Donor labels but prepend the display name!
        profileRoleEl.innerHTML = `<strong style="color: white; display: block; margin-bottom: 2px; font-weight: 700;">${userName}</strong>${currentRole}`;
    }

    
    // 5. Update welcome banner title dynamically
    const bannerTitleEl = document.querySelector('.welcome-banner-title');
    if (bannerTitleEl) {
        bannerTitleEl.textContent = `HELLO, ${userEmail}`;
    }

    // 4. Custom Logout Button Behavior
    let logoutBtn = document.getElementById('btn-logout') || document.querySelector('.sidebar-item[href="login.html"]');
    if (!logoutBtn) {
        // Fallback: search by text content to support older cached HTML structures
        logoutBtn = Array.from(document.querySelectorAll('.sidebar-item')).find(el => el.textContent.trim().toLowerCase().includes('logout'));
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Show toast message
            showToast("Logging Out... Safe Journey!");
            
            // Clear credentials
            localStorage.removeItem('currentUserEmail');
            localStorage.removeItem('currentUserName');
            
            // Redirect to login.html after delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        });
    }
}

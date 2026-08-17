import os

def update_exhibitors():
    root = r"C:\Exhibition Management Website"
    path = os.path.join(root, "exhibitors.html")
    
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Target content to insert Cards 7 and 8 (using exact spaces and newlines)
    target_card_pattern = """          <div class="exhibitor-footer-meta">
            <span class="booth-number-tag"><i class="fa-solid fa-store"></i> Booth E-102</span>
            <a href="exhibition-details.html" class="btn btn-outline" style="padding: 6px 12px; font-size: 0.8rem;">Details</a>
          </div>
        </div>

      </div>"""
      
    replacement_card_pattern = """          <div class="exhibitor-footer-meta">
            <span class="booth-number-tag"><i class="fa-solid fa-store"></i> Booth E-102</span>
            <a href="exhibition-details.html" class="btn btn-outline" style="padding: 6px 12px; font-size: 0.8rem;">Details</a>
          </div>
        </div>

        <!-- Card 7 -->
        <div class="exhibitor-card-full" data-industry="manufacturing">
          <div>
            <div class="exhibitor-header">
              <div class="exhibitor-avatar-circle" style="background: linear-gradient(135deg, #10B981, #3B82F6);">AD</div>
              <div class="exhibitor-title-meta">
                <h3>AeroDynamics Inc.</h3>
                <span class="exhibitor-industry-tag">Manufacturing</span>
              </div>
            </div>
            <div class="exhibitor-body">
              <p>Pioneering next-generation carbon-composite parts, smart drone assemblies, and heavy industrial machinery for civil and commercial flight sectors.</p>
            </div>
          </div>
          <div class="exhibitor-footer-meta">
            <span class="booth-number-tag"><i class="fa-solid fa-store"></i> Booth C-302</span>
            <a href="exhibition-details.html" class="btn btn-outline" style="padding: 6px 12px; font-size: 0.8rem;">Details</a>
          </div>
        </div>

        <!-- Card 8 -->
        <div class="exhibitor-card-full" data-industry="finance">
          <div>
            <div class="exhibitor-header">
              <div class="exhibitor-avatar-circle" style="background: linear-gradient(135deg, #FF6B35, #E11D48);">VW</div>
              <div class="exhibitor-title-meta">
                <h3>Vanguard Wealth</h3>
                <span class="exhibitor-industry-tag">Finance & Investment</span>
              </div>
            </div>
            <div class="exhibitor-body">
              <p>Providing smart robo-advisory wealth management solutions, global investment banking assets, and micro-loan validation networks for digital trade companies.</p>
            </div>
          </div>
          <div class="exhibitor-footer-meta">
            <span class="booth-number-tag"><i class="fa-solid fa-store"></i> Booth B-205</span>
            <a href="exhibition-details.html" class="btn btn-outline" style="padding: 6px 12px; font-size: 0.8rem;">Details</a>
          </div>
        </div>

      </div>"""

    if target_card_pattern in content:
        content = content.replace(target_card_pattern, replacement_card_pattern)
        print("Inserted Exhibitors 7 and 8.")
    else:
        print("Midwest Power exhibitor card pattern not found!")

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Completed exhibitors.html update.")

if __name__ == "__main__":
    update_exhibitors()

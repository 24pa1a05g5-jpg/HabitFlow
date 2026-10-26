const { spawn } = require('child_process');
const http = require('http');

async function testFullBackend() {
  console.log("=== STARTING FULL BACKEND FUNCTIONALITY VERIFICATION ===");

  const serverProcess = spawn('node', ['server.js'], {
    cwd: '/Users/simonjoe/.gemini/antigravity/scratch/habit-tracker/server',
    env: { ...process.env, PORT: '5055' }
  });

  serverProcess.stdout.on('data', (d) => process.stdout.write('[Server] ' + d.toString()));
  serverProcess.stderr.on('data', (d) => process.stderr.write('[Server Err] ' + d.toString()));

  // Wait for server to boot
  await new Promise(r => setTimeout(r, 2500));

  const request = (path, method = 'GET', body = null, token = null) => {
    return new Promise((resolve, reject) => {
      const payload = body ? JSON.stringify(body) : null;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (payload) headers['Content-Length'] = Buffer.byteLength(payload);

      const req = http.request({
        hostname: '127.0.0.1',
        port: 5055,
        path: `/api${path}`,
        method,
        headers,
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch(e) {
            resolve({ status: res.statusCode, data });
          }
        });
      });

      req.on('error', reject);
      if (payload) req.write(payload);
      req.end();
    });
  };

  try {
    // 1. Health check
    console.log("\n[Test 1] Checking API Health...");
    const health = await request('/health');
    console.log("Health response:", health);
    if (health.status !== 200 || !health.data.database) throw new Error("Health check failed");

    // 2. Register user
    console.log("\n[Test 2] Registering test user...");
    const userPayload = {
      name: "Alex Rivera",
      email: `alex_${Date.now()}@example.com`,
      password: "password123",
    };
    const regRes = await request('/auth/register', 'POST', userPayload);
    console.log("Register status:", regRes.status, "User ID:", regRes.data.user?.id);
    if (regRes.status !== 201 || !regRes.data.token) throw new Error("Registration failed");
    const token = regRes.data.token;

    // 3. Duplicate registration check
    console.log("\n[Test 3] Testing duplicate registration rejection...");
    const dupRes = await request('/auth/register', 'POST', userPayload);
    console.log("Duplicate register status:", dupRes.status);
    if (dupRes.status !== 409) throw new Error("Duplicate registration should return 409");

    // 4. Login
    console.log("\n[Test 4] Logging in...");
    const loginRes = await request('/auth/login', 'POST', {
      email: userPayload.email,
      password: userPayload.password,
    });
    console.log("Login status:", loginRes.status, "Token exists:", !!loginRes.data.token);
    if (loginRes.status !== 200) throw new Error("Login failed");

    // 5. Invalid login check
    console.log("\n[Test 5] Testing invalid login credentials...");
    const badLoginRes = await request('/auth/login', 'POST', {
      email: userPayload.email,
      password: "wrongpassword",
    });
    console.log("Bad login status:", badLoginRes.status);
    if (badLoginRes.status !== 401) throw new Error("Bad login should return 401");

    // 6. Create habit
    console.log("\n[Test 6] Creating habit with custom color and category...");
    const habit1 = await request('/habits', 'POST', {
      name: "Drink 2.5L Water Daily",
      description: "Hydrate properly during work",
      color: "#06b6d4",
      category: "Health & Wellness",
    }, token);
    console.log("Habit 1 created:", habit1.status, habit1.data.name, "category:", habit1.data.category);
    if (habit1.status !== 201 || !habit1.data._id) throw new Error("Create habit 1 failed");

    const habit2 = await request('/habits', 'POST', {
      name: "Morning Meditation 15m",
      description: "Mindful breathing session",
      color: "#10b981",
      category: "Mindfulness",
    }, token);
    console.log("Habit 2 created:", habit2.status, habit2.data.name);

    // 7. Get habits
    console.log("\n[Test 7] Fetching habits list...");
    const habitsList = await request('/habits', 'GET', null, token);
    console.log("Habits count:", habitsList.data.length);
    if (habitsList.data.length !== 2) throw new Error("Expected 2 habits");

    // 8. Toggle habit today
    console.log("\n[Test 8] Toggling habit 1 for today...");
    const toggle1 = await request(`/habits/${habit1.data._id}/toggle`, 'PATCH', null, token);
    console.log("Habit 1 completedDates:", toggle1.data.completedDates);
    if (toggle1.data.completedDates.length !== 1) throw new Error("Toggle today failed");

    // 9. Toggle habit for past date
    console.log("\n[Test 9] Toggling habit 1 for yesterday (past date support)...");
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`;
    const togglePast = await request(`/habits/${habit1.data._id}/toggle`, 'PATCH', { date: yStr }, token);
    console.log("Habit 1 dates after past toggle:", togglePast.data.completedDates);
    if (!togglePast.data.completedDates.includes(yStr)) throw new Error("Past date toggle failed");

    // 10. Get Stats
    console.log("\n[Test 10] Fetching stats...");
    const statsRes = await request('/habits/stats', 'GET', null, token);
    console.log("Stats response:", JSON.stringify(statsRes.data, null, 2));
    if (statsRes.status !== 200 || !statsRes.data.last7Days || statsRes.data.last7Days.length !== 7) {
      throw new Error("Stats or last7Days missing");
    }

    // 11. Update habit
    console.log("\n[Test 11] Updating habit 2...");
    const updateRes = await request(`/habits/${habit2.data._id}`, 'PUT', {
      name: "Morning Meditation 20m",
      description: "Extended to 20 minutes with timer",
      color: "#8b5cf6",
      category: "Mind & Spirit",
    }, token);
    console.log("Update status:", updateRes.status, "New name:", updateRes.data.name, "New color:", updateRes.data.color);
    if (updateRes.data.name !== "Morning Meditation 20m") throw new Error("Update habit failed");

    // 12. Delete habit
    console.log("\n[Test 12] Deleting habit 2...");
    const delRes = await request(`/habits/${habit2.data._id}`, 'DELETE', null, token);
    console.log("Delete status:", delRes.status);
    if (delRes.status !== 200) throw new Error("Delete habit failed");

    // Verify deletion
    const habitsAfterDel = await request('/habits', 'GET', null, token);
    console.log("Habits count after deletion:", habitsAfterDel.data.length);
    if (habitsAfterDel.data.length !== 1) throw new Error("Habit count after deletion should be 1");

    console.log("\n✅ ALL 12 VERIFICATION TESTS PASSED FLAWLESSLY!\n");
  } finally {
    serverProcess.kill();
  }
}

testFullBackend().catch(err => {
  console.error("❌ TEST FAILED:", err);
  process.exit(1);
});

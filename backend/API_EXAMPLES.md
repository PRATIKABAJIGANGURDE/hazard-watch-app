# INCOIS Hazard Reporting API Examples

This document provides practical examples of how to use the INCOIS Hazard Reporting API endpoints.

## 🔐 Authentication Examples

### Register a New User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ravi Kumar",
    "email": "ravi.kumar@gmail.com",
    "password": "securePassword123"
  }'
```

Response:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Ravi Kumar",
    "email": "ravi.kumar@gmail.com",
    "role": "citizen"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ravi.kumar@gmail.com",
    "password": "securePassword123"
  }'
```

### Get User Profile

```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📊 Report Examples

### Submit a Hazard Report

```bash
curl -X POST http://localhost:3001/api/reports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "event_type": "high_wave",
    "description": "Observed unusually high waves at Marina Beach around 2 PM. Waves reaching approximately 4 meters. Local fishermen have moved their boats to safety.",
    "longitude": 80.2707,
    "latitude": 13.0827,
    "location_name": "Marina Beach, Chennai, Tamil Nadu"
  }'
```

### Submit Report with Media Files

```bash
curl -X POST http://localhost:3001/api/reports \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "event_type=flood" \
  -F "description=Street flooding in residential area after heavy rain" \
  -F "longitude=77.5946" \
  -F "latitude=12.9716" \
  -F "location_name=Bangalore, Karnataka" \
  -F "media=@/path/to/flood_photo.jpg" \
  -F "media=@/path/to/flood_video.mp4"
```

### Get All Reports

```bash
# Basic request
curl -X GET http://localhost:3001/api/reports

# With filters
curl -X GET "http://localhost:3001/api/reports?event_type=high_wave&verified=true&limit=10"

# With bounding box (Chennai area)
curl -X GET "http://localhost:3001/api/reports?bbox=80.1,12.9,80.3,13.2"

# With date range
curl -X GET "http://localhost:3001/api/reports?start_date=2024-01-01&end_date=2024-01-31"
```

### Get Report Hotspots

```bash
curl -X GET "http://localhost:3001/api/reports/hotspots?clusters=5&days=30"
```

Response:
```json
{
  "hotspots": [
    {
      "cluster_id": 1,
      "event_type": "high_wave",
      "report_count": 15,
      "center_lat": 13.0827,
      "center_lon": 80.2707
    }
  ],
  "parameters": {
    "cluster_count": 5,
    "days_back": 30,
    "min_date": "2024-01-01T00:00:00.000Z"
  }
}
```

### Verify a Report (Analyst/Admin only)

```bash
curl -X PATCH http://localhost:3001/api/reports/REPORT_ID/verify \
  -H "Authorization: Bearer ANALYST_OR_ADMIN_TOKEN"
```

## 🌐 Social Media Examples

### Get Social Media Trends

```bash
curl -X GET http://localhost:3001/api/social/trends
```

### Get Posts by Location

```bash
curl -X GET "http://localhost:3001/api/social/posts/location?lat=13.0827&lng=80.2707&radius=50"
```

## 📈 Dashboard Examples (Analyst/Admin only)

### Get Dashboard Statistics

```bash
curl -X GET http://localhost:3001/api/dashboard/stats \
  -H "Authorization: Bearer ANALYST_OR_ADMIN_TOKEN"
```

Response:
```json
{
  "total_reports": 156,
  "unverified_reports": 23,
  "reports_today": 8,
  "reports_this_week": 45,
  "event_type_breakdown": {
    "high_wave": 67,
    "flood": 34,
    "tsunami": 2,
    "unusual_tide": 28,
    "other": 25
  },
  "hotspots": [
    {
      "cluster_id": 1,
      "event_type": "high_wave",
      "report_count": 15,
      "center_lat": 13.0827,
      "center_lon": 80.2707
    }
  ]
}
```

### Export Reports (Admin only)

```bash
# Export as JSON
curl -X GET http://localhost:3001/api/dashboard/export/reports \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Export as CSV
curl -X GET "http://localhost:3001/api/dashboard/export/reports?format=csv" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -o hazard_reports.csv

# Export only verified reports
curl -X GET "http://localhost:3001/api/dashboard/export/reports?verified_only=true" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Get Analytics

```bash
curl -X GET http://localhost:3001/api/dashboard/analytics \
  -H "Authorization: Bearer ANALYST_OR_ADMIN_TOKEN"
```

## 🔌 WebSocket Examples

### JavaScript Client Example

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

// Authenticate
socket.emit('authenticate', { token: 'YOUR_JWT_TOKEN' });

// Listen for authentication response
socket.on('authenticated', (data) => {
  console.log('Authenticated as:', data.user);
  
  // Subscribe to reports in Chennai area
  socket.emit('subscribe_location', {
    bbox: {
      minLat: 12.9,
      maxLat: 13.2,
      minLon: 80.1,
      maxLon: 80.3
    }
  });
});

// Listen for new reports
socket.on('new_report', (data) => {
  console.log('New report received:', data.report);
  // Update your UI with the new report
});

// Listen for report verifications
socket.on('report_verified', (data) => {
  console.log('Report verified:', data.report);
  // Update report status in your UI
});

// Listen for dashboard updates (analysts/admins)
socket.on('dashboard_update', (data) => {
  console.log('Dashboard updated:', data.stats);
  // Update dashboard charts/stats
});

// Handle authentication errors
socket.on('auth_error', (data) => {
  console.error('Authentication failed:', data.error);
});
```

### React Hook Example

```javascript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export const useRealtimeReports = (token, bbox) => {
  const [socket, setSocket] = useState(null);
  const [reports, setReports] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    // Authenticate
    newSocket.emit('authenticate', { token });

    // Handle authentication
    newSocket.on('authenticated', (data) => {
      setConnected(true);
      console.log('Connected as:', data.user);
      
      // Subscribe to location if bbox provided
      if (bbox) {
        newSocket.emit('subscribe_location', { bbox });
      }
    });

    // Handle new reports
    newSocket.on('new_report', (data) => {
      setReports(prev => [data.report, ...prev]);
    });

    // Handle report verification
    newSocket.on('report_verified', (data) => {
      setReports(prev => 
        prev.map(report => 
          report.id === data.report.id 
            ? { ...report, verified: true }
            : report
        )
      );
    });

    // Cleanup
    return () => {
      newSocket.close();
    };
  }, [token, bbox]);

  return { socket, reports, connected };
};
```

## 📱 Mobile App Integration

### React Native Example

```javascript
import { io } from 'socket.io-client';

class HazardReportingService {
  constructor(token) {
    this.socket = io('http://localhost:3001');
    this.token = token;
    this.connect();
  }

  connect() {
    this.socket.emit('authenticate', { token: this.token });
    
    this.socket.on('authenticated', (data) => {
      console.log('Mobile app authenticated:', data.user);
    });

    this.socket.on('new_report', (data) => {
      // Show push notification
      this.showPushNotification(data.report);
    });
  }

  subscribeToNearbyReports(userLocation, radiusKm = 50) {
    // Calculate bounding box around user
    const bbox = this.calculateBbox(userLocation, radiusKm);
    this.socket.emit('subscribe_location', { bbox });
  }

  submitReport(reportData, mediaFiles) {
    const formData = new FormData();
    
    Object.keys(reportData).forEach(key => {
      formData.append(key, reportData[key]);
    });
    
    mediaFiles.forEach((file, index) => {
      formData.append('media', file);
    });

    return fetch('http://localhost:3001/api/reports', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      body: formData
    });
  }
}
```

## 🧪 Testing Scenarios

### Scenario 1: Citizen Reports High Waves

```bash
# 1. Register as citizen
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fisherman Raj",
    "email": "raj.fisherman@gmail.com",
    "password": "fisherman123"
  }'

# 2. Login and get token
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "raj.fisherman@gmail.com", "password": "fisherman123"}' \
  | jq -r '.token')

# 3. Submit high wave report
curl -X POST http://localhost:3001/api/reports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "event_type": "high_wave",
    "description": "Dangerous waves hitting the shore. Height approximately 5 meters. All fishing boats have returned to harbor.",
    "longitude": 80.2707,
    "latitude": 13.0827,
    "location_name": "Marina Beach, Chennai"
  }'
```

### Scenario 2: Analyst Verification Workflow

```bash
# 1. Login as analyst
ANALYST_TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "analyst@incois.gov.in", "password": "analyst123"}' \
  | jq -r '.token')

# 2. Get unverified reports
curl -X GET "http://localhost:3001/api/reports?verified=false" \
  -H "Authorization: Bearer $ANALYST_TOKEN"

# 3. Verify a report
curl -X PATCH http://localhost:3001/api/reports/REPORT_ID/verify \
  -H "Authorization: Bearer $ANALYST_TOKEN"

# 4. Check dashboard stats
curl -X GET http://localhost:3001/api/dashboard/stats \
  -H "Authorization: Bearer $ANALYST_TOKEN"
```

### Scenario 3: Emergency Response

```bash
# Get all tsunami reports in the last 24 hours
curl -X GET "http://localhost:3001/api/reports?event_type=tsunami&start_date=$(date -d '1 day ago' --iso-8601)" \
  -H "Authorization: Bearer $TOKEN"

# Get reports in critical area (Bay of Bengal)
curl -X GET "http://localhost:3001/api/reports?bbox=80,10,90,20&event_type=tsunami" \
  -H "Authorization: Bearer $TOKEN"

# Get hotspots for immediate response
curl -X GET "http://localhost:3001/api/reports/hotspots?clusters=10&days=1" \
  -H "Authorization: Bearer $TOKEN"
```

## 🔄 Bulk Operations

### Batch Report Creation (for testing)

```javascript
// Node.js script for creating multiple test reports
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';
const token = 'YOUR_JWT_TOKEN';

const sampleReports = [
  {
    event_type: 'high_wave',
    description: 'High waves at Kovalam Beach',
    longitude: 76.9780,
    latitude: 8.4004,
    location_name: 'Kovalam Beach, Kerala'
  },
  {
    event_type: 'flood',
    description: 'Urban flooding in Hyderabad after heavy rain',
    longitude: 78.4867,
    latitude: 17.3850,
    location_name: 'Hyderabad, Telangana'
  },
  // Add more reports...
];

async function createBulkReports() {
  for (const report of sampleReports) {
    try {
      const response = await axios.post(`${API_BASE}/reports`, report, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Created report:', response.data.report.id);
    } catch (error) {
      console.error('Failed to create report:', error.response?.data);
    }
  }
}

createBulkReports();
```

## 📊 Data Analysis Examples

### Geographic Analysis

```bash
# Get reports by state (using location name)
curl -X GET "http://localhost:3001/api/reports" | \
  jq '[.reports[] | select(.location_name | contains("Tamil Nadu"))]'

# Get reports within 100km of Mumbai
curl -X GET "http://localhost:3001/api/reports?bbox=72.7,18.8,72.9,19.3"
```

### Temporal Analysis

```bash
# Reports in the last week
WEEK_AGO=$(date -d '7 days ago' --iso-8601)
curl -X GET "http://localhost:3001/api/reports?start_date=$WEEK_AGO"

# Today's reports by event type
TODAY=$(date --iso-8601)
curl -X GET "http://localhost:3001/api/reports?start_date=$TODAY&event_type=tsunami"
```

## 🎯 Integration Examples

### Frontend Integration (React)

```javascript
import axios from 'axios';

class HazardAPI {
  constructor(baseURL = 'http://localhost:3001/api') {
    this.api = axios.create({ baseURL });
    this.token = localStorage.getItem('auth_token');
    
    if (this.token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    }
  }

  // Authentication
  async login(email, password) {
    const response = await this.api.post('/auth/login', { email, password });
    this.token = response.data.token;
    localStorage.setItem('auth_token', this.token);
    this.api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    return response.data;
  }

  async register(userData) {
    const response = await this.api.post('/auth/register', userData);
    this.token = response.data.token;
    localStorage.setItem('auth_token', this.token);
    this.api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    return response.data;
  }

  // Reports
  async submitReport(reportData, files) {
    const formData = new FormData();
    
    Object.keys(reportData).forEach(key => {
      formData.append(key, reportData[key]);
    });
    
    if (files) {
      files.forEach(file => formData.append('media', file));
    }

    return this.api.post('/reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  async getReports(filters = {}) {
    return this.api.get('/reports', { params: filters });
  }

  async getHotspots(clusters = 5, days = 30) {
    return this.api.get('/reports/hotspots', {
      params: { clusters, days }
    });
  }

  // Dashboard
  async getDashboardStats() {
    return this.api.get('/dashboard/stats');
  }
}

export default HazardAPI;
```

### Python Integration

```python
import requests
import json
from datetime import datetime, timedelta

class IncoisHazardAPI:
    def __init__(self, base_url="http://localhost:3001/api"):
        self.base_url = base_url
        self.token = None
        self.session = requests.Session()
    
    def login(self, email, password):
        response = self.session.post(f"{self.base_url}/auth/login", 
                                   json={"email": email, "password": password})
        if response.status_code == 200:
            self.token = response.json()["token"]
            self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        return response.json()
    
    def submit_report(self, event_type, description, longitude, latitude, location_name=None):
        data = {
            "event_type": event_type,
            "description": description,
            "longitude": longitude,
            "latitude": latitude
        }
        if location_name:
            data["location_name"] = location_name
            
        response = self.session.post(f"{self.base_url}/reports", json=data)
        return response.json()
    
    def get_reports(self, **filters):
        response = self.session.get(f"{self.base_url}/reports", params=filters)
        return response.json()
    
    def get_hotspots(self, clusters=5, days=30):
        response = self.session.get(f"{self.base_url}/reports/hotspots", 
                                  params={"clusters": clusters, "days": days})
        return response.json()

# Example usage
api = IncoisHazardAPI()
api.login("analyst@incois.gov.in", "analyst123")

# Get all high wave reports from last week
week_ago = (datetime.now() - timedelta(days=7)).isoformat()
reports = api.get_reports(event_type="high_wave", start_date=week_ago)
print(f"Found {len(reports['reports'])} high wave reports")

# Get current hotspots
hotspots = api.get_hotspots()
for hotspot in hotspots['hotspots']:
    print(f"Hotspot: {hotspot['event_type']} - {hotspot['report_count']} reports")
```

## 🧪 Load Testing

### Artillery.js Load Test

```yaml
# load-test.yml
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10
  processor: "./test-functions.js"

scenarios:
  - name: "API Load Test"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password123"
          capture:
            - json: "$.token"
              as: "token"
      - get:
          url: "/api/reports"
          headers:
            Authorization: "Bearer {{ token }}"
      - post:
          url: "/api/reports"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            event_type: "high_wave"
            description: "Load test report"
            longitude: 80.2707
            latitude: 13.0827
```

Run with: `npx artillery run load-test.yml`

This comprehensive API provides all the functionality needed for Phase 1 of the INCOIS Hazard Reporting system, with clear paths for Phase 2 enhancements! 🌊
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Custom metric trends for per-endpoint breakdown
const ordersTrend = new Trend('orders_duration');
const inventoryTrend = new Trend('inventory_duration');
const machinesTrend = new Trend('machines_duration');
const orderCreationTrend = new Trend('order_creation_duration');
const quoteRequestTrend = new Trend('quote_request_duration');
const paymentsTrend = new Trend('payments_duration');
const errorRate = new Rate('error_rate');
const successfulRequests = new Counter('successful_requests');

export const options = {
  scenarios: {
    manufacturing_workload: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: __ENV.RAMP_UP || '5m', target: 100 },    // Ramp-up: 0 -> 100 users
        { duration: __ENV.HOLD || '10m', target: 100 },      // Steady hold: 100 users
        { duration: __ENV.RAMP_DOWN || '2m', target: 0 },    // Ramp-down: 100 -> 0 users
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    // SLA 1: p95 latency < 1000ms
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    // SLA 2: Error rate < 1%
    error_rate: ['rate<0.01'],
    http_req_failed: ['rate<0.01'],
    // SLA 3: Throughput >= 100 req/sec
    http_reqs: ['rate>=100'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Service-Key': 'forgeiq_internal_service_key_2026',
  'X-Org-ID': 'factory_acme_01',
};

export default function () {
  const roll = Math.random() * 100;

  // 1. 30% Workload: GET /orders
  if (roll < 30) {
    const res = http.get(`${BASE_URL}/api/orders`, { headers: JSON_HEADERS, timeout: '5s' });
    ordersTrend.add(res.timings.duration);
    const pass = check(res, {
      'GET /orders status 200': (r) => r.status === 200,
      'GET /orders latency < 1000ms': (r) => r.timings.duration < 1000,
    });
    errorRate.add(!pass);
    if (pass) successfulRequests.add(1);
  }
  // 2. 20% Workload: GET /inventory
  else if (roll < 50) {
    const res = http.get(`${BASE_URL}/api/inventory`, { headers: JSON_HEADERS, timeout: '5s' });
    inventoryTrend.add(res.timings.duration);
    const pass = check(res, {
      'GET /inventory status 200': (r) => r.status === 200,
      'GET /inventory latency < 1000ms': (r) => r.timings.duration < 1000,
    });
    errorRate.add(!pass);
    if (pass) successfulRequests.add(1);
  }
  // 3. 15% Workload: GET /machines
  else if (roll < 65) {
    const res = http.get(`${BASE_URL}/api/machines`, { headers: JSON_HEADERS, timeout: '5s' });
    machinesTrend.add(res.timings.duration);
    const pass = check(res, {
      'GET /machines status 200': (r) => r.status === 200,
      'GET /machines latency < 1000ms': (r) => r.timings.duration < 1000,
    });
    errorRate.add(!pass);
    if (pass) successfulRequests.add(1);
  }
  // 4. 20% Workload: POST /orders (Create active order)
  else if (roll < 85) {
    const payload = JSON.stringify({
      title: `Laser Cut Flange Batch #${Math.floor(Math.random() * 10000)}`,
      customerName: 'Apex Aerospace Solutions',
      priority: 'Normal',
      totalAmount: 38500,
      dueDate: '2026-09-30',
      materialSku: 'RAW-SS304-18G',
      quantityUnits: 50,
    });
    const res = http.post(`${BASE_URL}/api/orders`, payload, { headers: JSON_HEADERS, timeout: '5s' });
    orderCreationTrend.add(res.timings.duration);
    const pass = check(res, {
      'POST /orders status 200': (r) => r.status === 200 || r.status === 201,
      'POST /orders latency < 1000ms': (r) => r.timings.duration < 1000,
    });
    errorRate.add(!pass);
    if (pass) successfulRequests.add(1);
  }
  // 5. 10% Workload: POST /ai/quote-request (Submit RFQ / AI Estimation)
  else if (roll < 95) {
    const payload = JSON.stringify({
      material: 'SS304',
      thickness: 3.0,
      cutLengthMm: 1800.0,
      pierceCount: 8,
      bendCount: 4,
      quantity: 100,
    });
    const res = http.post(`${BASE_URL}/api/ai/quote-request`, payload, { headers: JSON_HEADERS, timeout: '5s' });
    quoteRequestTrend.add(res.timings.duration);
    const pass = check(res, {
      'POST /ai/quote-request status 200': (r) => r.status === 200,
      'POST /ai/quote-request latency < 1500ms': (r) => r.timings.duration < 1500,
    });
    errorRate.add(!pass);
    if (pass) successfulRequests.add(1);
  }
  // 6. 5% Workload: POST /payments (Create payment checkout)
  else {
    const payload = JSON.stringify({
      amount: 14500,
      currency: 'INR',
      receipt: `rcpt_load_${Date.now()}`,
    });
    const res = http.post(`${BASE_URL}/api/payments`, payload, { headers: JSON_HEADERS, timeout: '5s' });
    paymentsTrend.add(res.timings.duration);
    const pass = check(res, {
      'POST /payments status 200': (r) => r.status === 200,
      'POST /payments latency < 1000ms': (r) => r.timings.duration < 1000,
    });
    errorRate.add(!pass);
    if (pass) successfulRequests.add(1);
  }

  // Realistic thinking time between operations (200ms - 800ms)
  sleep(Math.random() * 0.6 + 0.2);
}

// Summary Report Generation
export function handleSummary(data) {
  const p95 = data.metrics.http_req_duration ? data.metrics.http_req_duration.values['p(95)'].toFixed(2) : 'N/A';
  const p99 = data.metrics.http_req_duration ? data.metrics.http_req_duration.values['p(99)'].toFixed(2) : 'N/A';
  const mean = data.metrics.http_req_duration ? data.metrics.http_req_duration.values.avg.toFixed(2) : 'N/A';
  const totalReqs = data.metrics.http_reqs ? data.metrics.http_reqs.values.count : 0;
  const rate = data.metrics.http_reqs ? data.metrics.http_reqs.values.rate.toFixed(1) : 'N/A';
  const errPct = data.metrics.http_req_failed ? (data.metrics.http_req_failed.values.rate * 100).toFixed(2) : '0.00';

  console.log('===============================================================');
  console.log('FORGEIQ K6 HIGH-CONCURRENCY LOAD TEST SUMMARY');
  console.log('===============================================================');
  console.log(`  Total Requests    : ${totalReqs}`);
  console.log(`  Throughput Rate   : ${rate} req/sec`);
  console.log(`  Mean Latency      : ${mean} ms`);
  console.log(`  p95 Latency       : ${p95} ms (SLA: < 1000 ms)`);
  console.log(`  p99 Latency       : ${p99} ms (SLA: < 2000 ms)`);
  console.log(`  Error Rate        : ${errPct} % (SLA: < 1.0 %)`);
  console.log('===============================================================');

  return {
    'performance/results/k6_summary.json': JSON.stringify(data, null, 2),
  };
}

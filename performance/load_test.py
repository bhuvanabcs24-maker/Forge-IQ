"""
ForgeIQ Production Load Test Suite - Locust Framework
Target: 100 Concurrent Users, 17-Minute Ramp/Hold/Ramp-down Soak Test
Workload Distribution:
  - 30%: GET /api/orders
  - 20%: GET /api/inventory
  - 15%: GET /api/machines
  - 20%: POST /api/orders
  - 10%: POST /ai/quote-request
  - 5%: POST /payments
"""

import json
import random
import time
from locust import HttpUser, task, between, LoadTestShape, events

HEADERS = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Service-Key": "forgeiq_internal_service_key_2026",
    "X-Org-ID": "factory_acme_01",
}

class ForgeIQUser(HttpUser):
    # Simulated realistic user think time: 0.2s - 0.8s
    wait_time = between(0.2, 0.8)

    # 1. 30% Workload: GET /orders (read recent orders)
    @task(30)
    def get_orders(self):
        with self.client.get("/api/orders", headers=HEADERS, name="GET /orders", catch_response=True) as response:
            if response.status_code == 200:
                if response.elapsed.total_seconds() > 5.0:
                    response.failure(f"Timeout SLA breached (>5000ms): {response.elapsed.total_seconds()}s")
                else:
                    response.success()
            else:
                response.failure(f"Unexpected status: {response.status_code}")

    # 2. 20% Workload: GET /inventory (check stock)
    @task(20)
    def get_inventory(self):
        with self.client.get("/api/inventory", headers=HEADERS, name="GET /inventory", catch_response=True) as response:
            if response.status_code == 200:
                if response.elapsed.total_seconds() > 5.0:
                    response.failure(f"Timeout SLA breached (>5000ms): {response.elapsed.total_seconds()}s")
                else:
                    response.success()
            else:
                response.failure(f"Unexpected status: {response.status_code}")

    # 3. 15% Workload: GET /machines (view equipment)
    @task(15)
    def get_machines(self):
        with self.client.get("/api/machines", headers=HEADERS, name="GET /machines", catch_response=True) as response:
            if response.status_code == 200:
                if response.elapsed.total_seconds() > 5.0:
                    response.failure(f"Timeout SLA breached (>5000ms): {response.elapsed.total_seconds()}s")
                else:
                    response.success()
            else:
                response.failure(f"Unexpected status: {response.status_code}")

    # 4. 20% Workload: POST /orders (create new order)
    @task(20)
    def post_orders(self):
        order_payload = {
            "title": f"Precision Bracket Run #{random.randint(1000, 99999)}",
            "customerName": "Titan Industrial Dynamics",
            "priority": "Normal",
            "totalAmount": random.choice([25000, 48000, 75000]),
            "dueDate": "2026-10-15",
            "materialSku": "RAW-SS304-18G",
            "quantityUnits": random.randint(10, 200)
        }
        with self.client.post("/api/orders", json=order_payload, headers=HEADERS, name="POST /orders", catch_response=True) as response:
            if response.status_code in (200, 201):
                if response.elapsed.total_seconds() > 5.0:
                    response.failure(f"Timeout SLA breached (>5000ms): {response.elapsed.total_seconds()}s")
                else:
                    response.success()
            else:
                response.failure(f"Order creation failed: {response.status_code}")

    # 5. 10% Workload: POST /ai/quote-request (submit RFQ / AI estimation)
    @task(10)
    def post_ai_quote_request(self):
        rfq_payload = {
            "material": random.choice(["SS304", "AL6061", "MildSteel"]),
            "thickness": random.choice([1.5, 3.0, 5.0]),
            "cutLengthMm": round(random.uniform(500.0, 3200.0), 1),
            "pierceCount": random.randint(4, 30),
            "bendCount": random.randint(0, 8),
            "quantity": random.randint(50, 500)
        }
        with self.client.post("/api/ai/quote-request", json=rfq_payload, headers=HEADERS, name="POST /ai/quote-request", catch_response=True) as response:
            if response.status_code == 200:
                if response.elapsed.total_seconds() > 5.0:
                    response.failure(f"Timeout SLA breached (>5000ms): {response.elapsed.total_seconds()}s")
                else:
                    response.success()
            else:
                response.failure(f"AI Quote request failed: {response.status_code}")

    # 6. 5% Workload: POST /payments (create payment checkout)
    @task(5)
    def post_payments(self):
        payment_payload = {
            "amount": random.choice([12000, 35000, 68000]),
            "currency": "INR",
            "receipt": f"rcpt_locust_{int(time.time() * 1000)}"
        }
        with self.client.post("/api/payments", json=payment_payload, headers=HEADERS, name="POST /payments", catch_response=True) as response:
            if response.status_code == 200:
                if response.elapsed.total_seconds() > 5.0:
                    response.failure(f"Timeout SLA breached (>5000ms): {response.elapsed.total_seconds()}s")
                else:
                    response.success()
            else:
                response.failure(f"Payment initiation failed: {response.status_code}")


class ManufacturingSoakShape(LoadTestShape):
    """
    Automated 17-minute stage profile:
    - Stage 1: Ramp up 0 -> 100 users over 5 minutes (300 seconds)
    - Stage 2: Hold 100 users for 10 minutes (600 seconds -> total 900s)
    - Stage 3: Ramp down 100 -> 0 users over 2 minutes (120 seconds -> total 1020s)
    """
    stages = [
        {"duration": 300, "users": 100, "spawn_rate": 0.33},   # 0 -> 100 users in 300s
        {"duration": 900, "users": 100, "spawn_rate": 10},     # Hold 100 users for 600s
        {"duration": 1020, "users": 0, "spawn_rate": 0.83},    # 100 -> 0 users in 120s
    ]

    def tick(self):
        run_time = self.get_run_time()
        for stage in self.stages:
            if run_time < stage["duration"]:
                tick_data = (stage["users"], stage["spawn_rate"])
                return tick_data
        return None

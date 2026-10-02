"""Explicit, synthetic baseline probes; never prints credentials or tokens."""
import json
import urllib.request
import urllib.error

BASE = "http://localhost:8000"

def call(path, data=None, token=None, method=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(BASE + path, data=json.dumps(data).encode() if data is not None else None, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            return response.status, json.load(response)
    except urllib.error.HTTPError as error:
        return error.code, json.load(error)

if __name__ == "__main__":
    print("health", call("/health/ready"))
    print("anonymous_admin", call("/api/v1/admin/dashboard")[0])
    print("anonymous_cases", call("/api/v1/journey/cases")[0])
    code, demo = call("/api/v1/identity/demo/switch-role", {"role": "ministry_admin"})
    print("demo_mint", code)
    if code == 200:
        print("demo_admin", call("/api/v1/admin/dashboard", token=demo["access_token"])[0])
    code, login = call("/api/v1/identity/login", {"username": "ramesh@beneficiary.lip", "password": "ramesh123"})
    print("beneficiary_login", code)
    if code == 200:
        token = login["access_token"]
        print("beneficiary_admin", call("/api/v1/admin/dashboard", token=token)[0])
        print("missing_action", call("/api/v1/journey/actions/act-2", {"status": "completed"}, token, "PUT"))
    code, profile = call("/api/v1/beneficiaries/", {"full_name": "Independent audit synthetic anonymous", "district_code": "MH-NAG"})
    print("anonymous_create", code, profile)
    if code == 200:
        print("anonymous_passport", call(f"/api/v1/beneficiaries/{profile['id']}/passport")[0])

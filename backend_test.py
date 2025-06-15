import requests
import unittest
import json
import uuid
from datetime import datetime, timedelta

# Backend URL from frontend/.env
BACKEND_URL = "https://3cb9af0c-7c8f-4a29-8e4b-2c0ccfc6f4fc.preview.emergentagent.com"
API_URL = f"{BACKEND_URL}/api"

class TourAPITester(unittest.TestCase):
    """Test class for Tour Management API endpoints"""
    
    def setUp(self):
        """Setup for each test - create a unique test tour"""
        self.test_id = str(uuid.uuid4())[:8]
        self.test_tour_data = {
            "title": f"Tropical Paradise Getaway {self.test_id}",
            "destination": "Bali, Indonesia",
            "description": "Experience the beauty of Bali with pristine beaches, cultural temples, and luxury accommodations",
            "duration": 7,
            "price": 1299.0,
            "max_capacity": 20,
            "available_spots": 15,
            "start_date": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
            "end_date": (datetime.now() + timedelta(days=37)).strftime("%Y-%m-%d"),
            "image_url": "https://images.pexels.com/photos/358229/pexels-photo-358229.jpeg",
            "package_details": {
                "transportation": "Flight + Private Transfer",
                "accommodation": "5-star Resort",
                "activities": "Snorkeling, Temple Tours, Spa"
            }
        }
        
        # Create a test tour for use in tests
        response = requests.post(f"{API_URL}/tours", json=self.test_tour_data)
        if response.status_code == 200 or response.status_code == 201:
            self.test_tour = response.json()
            print(f"✅ Test tour created: {self.test_tour['title']}")
        else:
            print(f"❌ Failed to create test tour: {response.status_code} - {response.text}")
            self.test_tour = None
    
    def test_01_api_root(self):
        """Test the API root endpoint"""
        print("\n🔍 Testing API root endpoint...")
        response = requests.get(f"{API_URL}/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)
        print(f"✅ API root endpoint working: {data['message']}")
    
    def test_02_get_tours(self):
        """Test getting all tours"""
        print("\n🔍 Testing GET /tours endpoint...")
        response = requests.get(f"{API_URL}/tours")
        self.assertEqual(response.status_code, 200)
        tours = response.json()
        self.assertIsInstance(tours, list)
        print(f"✅ GET /tours returned {len(tours)} tours")
    
    def test_03_get_tour_by_id(self):
        """Test getting a specific tour by ID"""
        if not self.test_tour:
            self.skipTest("Test tour not created")
        
        print(f"\n🔍 Testing GET /tours/{self.test_tour['id']} endpoint...")
        response = requests.get(f"{API_URL}/tours/{self.test_tour['id']}")
        self.assertEqual(response.status_code, 200)
        tour = response.json()
        self.assertEqual(tour['id'], self.test_tour['id'])
        self.assertEqual(tour['title'], self.test_tour['title'])
        print(f"✅ GET /tours/{self.test_tour['id']} returned correct tour")
    
    def test_04_search_tours(self):
        """Test searching for tours"""
        if not self.test_tour:
            self.skipTest("Test tour not created")
            
        print("\n🔍 Testing search functionality...")
        # Search by title
        response = requests.get(f"{API_URL}/tours?search={self.test_id}")
        self.assertEqual(response.status_code, 200)
        tours = response.json()
        self.assertGreaterEqual(len(tours), 1)
        found = False
        for tour in tours:
            if tour['id'] == self.test_tour['id']:
                found = True
                break
        self.assertTrue(found, "Test tour not found in search results")
        print(f"✅ Search by title returned {len(tours)} results including test tour")
        
        # Search by destination
        response = requests.get(f"{API_URL}/tours?search=Bali")
        self.assertEqual(response.status_code, 200)
        tours = response.json()
        print(f"✅ Search by destination returned {len(tours)} results")
    
    def test_05_update_tour(self):
        """Test updating a tour"""
        if not self.test_tour:
            self.skipTest("Test tour not created")
            
        print(f"\n🔍 Testing PUT /tours/{self.test_tour['id']} endpoint...")
        update_data = {
            "price": 1399.0,
            "available_spots": 10
        }
        response = requests.put(f"{API_URL}/tours/{self.test_tour['id']}", json=update_data)
        self.assertEqual(response.status_code, 200)
        updated_tour = response.json()
        self.assertEqual(updated_tour['id'], self.test_tour['id'])
        self.assertEqual(updated_tour['price'], 1399.0)
        self.assertEqual(updated_tour['available_spots'], 10)
        print(f"✅ PUT /tours/{self.test_tour['id']} successfully updated tour")
    
    def test_06_delete_tour(self):
        """Test deleting a tour"""
        if not self.test_tour:
            self.skipTest("Test tour not created")
            
        print(f"\n🔍 Testing DELETE /tours/{self.test_tour['id']} endpoint...")
        response = requests.delete(f"{API_URL}/tours/{self.test_tour['id']}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)
        
        # Verify tour is deleted
        response = requests.get(f"{API_URL}/tours/{self.test_tour['id']}")
        self.assertEqual(response.status_code, 404)
        print(f"✅ DELETE /tours/{self.test_tour['id']} successfully deleted tour")

if __name__ == "__main__":
    print("🚀 Starting Tour Management API Tests")
    print(f"🌐 Testing against API URL: {API_URL}")
    unittest.main(verbosity=2)
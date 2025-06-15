import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TravelAgencyApp = () => {
  const [tours, setTours] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Default tour images
  const tourImages = [
    "https://images.pexels.com/photos/358229/pexels-photo-358229.jpeg",
    "https://images.pexels.com/photos/32530345/pexels-photo-32530345.jpeg",
    "https://images.pexels.com/photos/1051075/pexels-photo-1051075.jpeg",
    "https://images.unsplash.com/photo-1484821582734-6c6c9f99a672",
    "https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg"
  ];

  const fetchTours = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/tours${searchTerm ? `?search=${searchTerm}` : ''}`);
      setTours(response.data);
    } catch (error) {
      console.error("Error fetching tours:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTours();
  }, [searchTerm]);

  const TourCard = ({ tour }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
      <div className="relative h-48">
        <img 
          src={tour.image_url} 
          alt={tour.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          ${tour.price}
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{tour.title}</h3>
          <span className="text-sm text-gray-500">{tour.duration} days</span>
        </div>
        <p className="text-gray-600 mb-3 line-clamp-2">{tour.description}</p>
        <div className="flex items-center mb-3">
          <svg className="w-4 h-4 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="text-gray-600 text-sm">{tour.destination}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-green-600 font-semibold">
            {tour.available_spots}/{tour.max_capacity} spots available
          </span>
          <button 
            onClick={() => setSelectedTour(tour)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  const AddTourForm = ({ onClose, onAdd }) => {
    const [formData, setFormData] = useState({
      title: "",
      description: "",
      destination: "",
      duration: "",
      price: "",
      max_capacity: "",
      available_spots: "",
      start_date: "",
      end_date: "",
      image_url: tourImages[0],
      package_details: {
        transportation: "",
        accommodation: "",
        activities: ""
      }
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.post(`${API}/tours`, {
          ...formData,
          duration: parseInt(formData.duration),
          price: parseFloat(formData.price),
          max_capacity: parseInt(formData.max_capacity),
          available_spots: parseInt(formData.available_spots)
        });
        onAdd(response.data);
        onClose();
      } catch (error) {
        console.error("Error creating tour:", error);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add New Tour</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tour Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                  <input
                    type="text"
                    required
                    value={formData.destination}
                    onChange={(e) => setFormData({...formData, destination: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
                  <input
                    type="number"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Capacity</label>
                  <input
                    type="number"
                    required
                    value={formData.max_capacity}
                    onChange={(e) => setFormData({...formData, max_capacity: e.target.value, available_spots: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tour Image</label>
                <select
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {tourImages.map((img, index) => (
                    <option key={index} value={img}>Image {index + 1}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Tour
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const TourDetailsModal = ({ tour, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <img 
            src={tour.image_url} 
            alt={tour.title}
            className="w-full h-64 object-cover rounded-t-xl"
          />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-3xl font-bold text-gray-800">{tour.title}</h2>
            <span className="text-2xl font-bold text-blue-600">${tour.price}</span>
          </div>
          <div className="flex items-center mb-4">
            <svg className="w-5 h-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-600 text-lg">{tour.destination}</span>
            <span className="mx-4 text-gray-400">•</span>
            <span className="text-gray-600">{tour.duration} days</span>
          </div>
          <p className="text-gray-700 mb-6 leading-relaxed">{tour.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Tour Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Start Date:</span>
                  <span className="font-semibold">{tour.start_date}</span>
                </div>
                <div className="flex justify-between">
                  <span>End Date:</span>
                  <span className="font-semibold">{tour.end_date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Available Spots:</span>
                  <span className="font-semibold text-green-600">{tour.available_spots}/{tour.max_capacity}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Package Includes</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Transportation
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Accommodation
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Guided Activities
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Travel Agency Management</h1>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Tour
            </button>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search tours by title, description, or destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg className="absolute left-4 top-4 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Tours Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading tours...</p>
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tours found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? "Try adjusting your search terms" : "Get started by creating a new tour"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {showAddForm && (
        <AddTourForm 
          onClose={() => setShowAddForm(false)} 
          onAdd={() => fetchTours()} 
        />
      )}
      
      {selectedTour && (
        <TourDetailsModal 
          tour={selectedTour} 
          onClose={() => setSelectedTour(null)} 
        />
      )}
    </div>
  );
};

export default TravelAgencyApp;
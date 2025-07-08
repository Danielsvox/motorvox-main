import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config/api';

const fetchCars = async () => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/cars/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Error fetching cars:', error);
    }
};

const fetchCarDetails = async (carId) => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/cars/${carId}/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Error fetching car details:', error);
    }
};

const createCar = async (carData) => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/cars/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(carData)
        });
    } catch (error) {
        console.error('Error creating car:', error);
    }
};

const updateCar = async (carId, carData) => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/cars/${carId}/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(carData)
        });
    } catch (error) {
        console.error('Error updating car:', error);
    }
};

const deleteCar = async (carId) => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/cars/${carId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Error deleting car:', error);
    }
}; 
import api from './api';

const addressService = {
  /**
   * Fetch all saved addresses for current authenticated customer
   */
  async getAddresses() {
    const response = await api.get('/profile/addresses');
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  /**
   * Add a new delivery address
   */
  async addAddress(addressData) {
    const payload = {
      label: addressData.label || 'Home',
      receiverName: addressData.receiverName || addressData.name || '',
      receiverPhone: addressData.receiverPhone || addressData.phone || '',
      fullAddress: addressData.fullAddress || addressData.street || '',
      landmark: addressData.landmark || '',
      city: addressData.city || '',
      state: addressData.state || '',
      pincode: addressData.pincode || '',
      latitude: addressData.latitude ? Number(addressData.latitude) : null,
      longitude: addressData.longitude ? Number(addressData.longitude) : null,
      isDefault: !!addressData.isDefault,
    };
    const response = await api.post('/profile/addresses', payload);
    return response.data?.data || response.data;
  },

  /**
   * Update an existing address
   */
  async updateAddress(id, addressData) {
    const payload = {
      label: addressData.label || 'Home',
      receiverName: addressData.receiverName || addressData.name || '',
      receiverPhone: addressData.receiverPhone || addressData.phone || '',
      fullAddress: addressData.fullAddress || addressData.street || '',
      landmark: addressData.landmark || '',
      city: addressData.city || '',
      state: addressData.state || '',
      pincode: addressData.pincode || '',
      latitude: addressData.latitude ? Number(addressData.latitude) : null,
      longitude: addressData.longitude ? Number(addressData.longitude) : null,
      isDefault: !!addressData.isDefault,
    };
    const response = await api.put(`/profile/addresses/${id}`, payload);
    return response.data?.data || response.data;
  },

  /**
   * Delete an address
   */
  async deleteAddress(id) {
    const response = await api.delete(`/profile/addresses/${id}`);
    return response.data;
  },

  /**
   * Set address as default delivery destination
   */
  async setDefaultAddress(id) {
    const response = await api.patch(`/profile/addresses/${id}/default`);
    return response.data?.data || response.data;
  },

  /**
   * Detect current GPS location from browser Geolocation API
   */
  getCurrentCoordinates() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error('Geolocation is not supported by your browser.'));
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          let msg = 'Unable to retrieve location.';
          if (error.code === error.PERMISSION_DENIED) {
            msg = 'Location access was denied. Please allow location permissions in your browser or enter your address manually.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg = 'Location information is currently unavailable.';
          } else if (error.code === error.TIMEOUT) {
            msg = 'Location request timed out. Please try again.';
          }
          reject(new Error(msg));
        },
        options
      );
    });
  },

  /**
   * Reverse-geocode coordinates into street address, city, state, pincode
   */
  async reverseGeocode(latitude, longitude) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
        },
      });

      if (!res.ok) {
        throw new Error('Reverse geocoding service returned an error');
      }

      const data = await res.json();
      const addr = data.address || {};

      // Formulate clean street and landmark details
      const streetParts = [
        addr.road || addr.pedestrian || addr.street,
        addr.suburb || addr.neighbourhood || addr.residential,
        addr.city_district,
      ].filter(Boolean);

      const street = streetParts.length > 0 ? streetParts.join(', ') : (data.display_name?.split(',')[0] || '');
      const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || '';
      const state = addr.state || '';
      const pincode = addr.postcode ? addr.postcode.replace(/[^0-9]/g, '').slice(0, 6) : '';
      const landmark = addr.amenity || addr.building || addr.neighbourhood || '';

      return {
        street,
        fullAddress: data.display_name || street,
        city,
        state,
        pincode,
        landmark,
        latitude,
        longitude,
      };
    } catch (err) {
      // Return basic coordinates if reverse lookup fails
      return {
        street: '',
        fullAddress: `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`,
        city: '',
        state: '',
        pincode: '',
        landmark: '',
        latitude,
        longitude,
      };
    }
  },
};

export default addressService;

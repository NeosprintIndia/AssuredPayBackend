import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';  // Import axios library for making HTTP requests
require('dotenv').config(); // Load environment variables from .env file
const API_Key = process.env.SandBox_API_Key; // Load Sandbox API key from environment
const Secret_Key = process.env.SandBox_Secret_Key; // Load Sandbox Secret key from environment


// Function to fetch admin data
const adminGetData = async () => {
    try {
      const response = await AUTHENTICATE_SB(); // Call AUTHENTICATE_SB function
  
      console.log("response",response)
      // Assuming the response structure is { body: { token: 'yourTokenValue' } }
      const token = response.body.access_token; // Extract the token from the response
      
      return { sandbox_token: token };
    } catch (error) {
      console.error("Error fetching admin data:", error);
      throw error; // You might want to handle or rethrow the error accordingly
    }
  };
// Function to authenticate with Sandbox API

const AUTHENTICATE_SB = () => {
    const instance = axios.create({
      baseURL: 'https://api.sandbox.co.in', // Base URL for the API
    });
  
    const config = {
      method: 'POST',
      url: '/authenticate', // API endpoint for authentication
      headers: {
        'x-api-key': API_Key,
        'x-api-secret': Secret_Key,
        'x-api-version': '1.0',
      },
    };
  

  // Send the request and handle the response
    return instance
      .request(config)
      .then((response) => {
        console.log(response.data);
        return { body: response.data };
      })
      .catch((error) => {
        throw error.response.data;
      });
  };

// Exported functions for various KYC verification processes

  export const PAN_KYC_SB = async (dynamicData: { id_number: string }) => {
    try {
      const instance = axios.create({
        baseURL: 'https://api.sandbox.co.in',
      });
  
      const adminData = await adminGetData();
      console.log(adminData)
      const token = adminData.sandbox_token;
  
      const config: AxiosRequestConfig = {
        method: 'POST',
        url: '/kyc/pan',
        headers: {
          Authorization: token,
          accept: 'application/json',
          'x-api-key': API_Key,
          'x-api-version': '1.0',
        },
        data: {
          pan: dynamicData.id_number,
          consent: 'Y',
          reason: 'For KYC of User',
        },
      };
  
      console.log(config);
  
      try {
        const response = await instance.request(config);
        console.log(response.data);
        return { body: response.data };
      } catch (error) {
        throw error.response.data;
      }
    } catch (err) {
      console.log(err);
    }
  };

export const GST_KYC_SB = async(dynamicData: { id_number: string }) => {
  const instance = axios.create({
    baseURL: 'https://api.sandbox.co.in',
  });
  const adminData = await adminGetData()
  const token = adminData.sandbox_token
  const config: AxiosRequestConfig = {
    method: 'GET',
    url: `/gsp/public/gstin/${dynamicData.id_number}`,
    headers: {
      Authorization: token,
      'x-api-key': API_Key,
      'x-api-version': '1.0'
    }
  };

  console.log(config);

  return new Promise((resolve, reject) => {
    instance
      .request(config)
      .then((response: AxiosResponse) => {
        console.log(response.data);
        resolve({ body: response.data });
      })
      .catch(error => {
        reject(error.response.data);
      });
  });
};

export const Aadhaar_KYC_S1 = async(dynamicData: { id_number: string }) => {

  console.log(dynamicData,"dynamicData")

  const adminData = await adminGetData()
  const token = adminData.sandbox_token
  const instance = axios.create({
    baseURL: 'https://api.sandbox.co.in',
  });
  const config: AxiosRequestConfig = {
    method: 'POST',
    url: '/kyc/aadhaar/okyc/otp',
    headers: {
      Authorization: token,
      accept: 'application/json',
      'x-api-key': API_Key,
      'x-api-version': '1.0',
      'content-type': 'application/json',
    },
    data: {
      aadhaar_number: dynamicData.id_number,
    },
 
  };

  console.log(config);

  return new Promise((resolve, reject) => {
    instance
      .request(config)
      .then((response: AxiosResponse) => {
        console.log(response.data);
        resolve({ body: response.data });
      })
      .catch(error => {
        reject(error.response.data);
      });
  });
};

export const Aadhaar_KYC_S2 = async(dynamicData: { otp: string; refId: string }) => {

  const adminData = await adminGetData()
  const token = adminData.sandbox_token
  const instance = axios.create({
    baseURL: 'https://api.sandbox.co.in',
  });
  const config: AxiosRequestConfig = {
    method: 'POST',
    url: '/kyc/aadhaar/okyc/otp/verify',
    headers: {
      Authorization: token,
      accept: 'application/json',
      'x-api-key': API_Key,
      'x-api-version': '1.0',
      'content-type': 'application/json',
    },
    data: {
      otp: dynamicData.otp,
      ref_id: dynamicData.refId,
    },
  };

  console.log(config);

  return new Promise((resolve, reject) => {
    instance
      .request(config)
      .then((response: AxiosResponse) => {
        console.log("Adhar OTP API Run")
        console.log(response.data);
        resolve({ body: response.data });
      })
      .catch(error => {
        console.log("Adhar OTP API Error")
        reject(error.response.data);
      });
  });
};

export const IFSC_Verify = async(dynamicData: { ifsc: string }) => {
  const adminData = await adminGetData()
  const token = adminData.sandbox_token
  const instance = axios.create({
    baseURL: 'https://api.sandbox.co.in',
  });
  const config: AxiosRequestConfig = {
    method: 'GET',
    url: `/bank/${dynamicData.ifsc}`,
    headers: {
      Authorization: token,
      accept: 'application/json',
      'x-api-key': API_Key,
      'x-api-version': '1.0',
      'content-type': 'application/json',
    },
  };

  console.log(config);

  return new Promise((resolve, reject) => {
    instance
      .request(config)
      .then((response: AxiosResponse) => {
        console.log(response.data);
        resolve({ body: response.data });
      })
      .catch(error => {
        reject(error.response.data);
      });
  });
};

export const Bank_Account_Verify = async(dynamicData: { ifsc: string; account_number: string; mobile: string; name: string }) => {
  const adminData = await adminGetData()
  const token = adminData.sandbox_token
  const instance = axios.create({
    baseURL: 'https://api.sandbox.co.in',
  });
  const config: AxiosRequestConfig = {
    method: 'POST',
    url: `	/bank/${dynamicData.ifsc}/accounts/${dynamicData.account_number}/verify`,
    headers: {
      Authorization: token,
      'x-api-key': API_Key,
      'x-api-version': '1.0',
    },
    params: {
      name: dynamicData.name,
      mobile: dynamicData.mobile,
    },
  };

  console.log(config);

  return new Promise((resolve, reject) => {
    instance
      .request(config)
      .then((response: AxiosResponse) => {
          console.log(response.data);
        resolve({ body: response.data });
      })
      .catch(error => {
        reject(error.response.data);
      });
  });
};

export const UPI_Verify = async(dynamicData: { VPA: string }) => {
  const adminData = await adminGetData()
  const token = adminData.sandbox_token
  const instance = axios.create({
    baseURL: 'https://api.sandbox.co.in',
  });
  const config: AxiosRequestConfig = {
    method: 'GET',
    url: `/bank/upi/${dynamicData.VPA}`,
    headers: {
      Authorization: token,
      'x-api-key': API_Key,
      'x-api-version': '1.0',
    },
  };

  console.log(config);

  return new Promise((resolve, reject) => {
    instance
      .request(config)
      .then((response: AxiosResponse) => {
        console.log(response.data);
        resolve({ body: response.data });
      })
      .catch(error => {
        reject(error.response.data);
      });
  });
};
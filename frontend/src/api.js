/**
 * SmartCart API Service
 * Handles communication with Flask REST API backend
 */

const BASE_URL = '/api';

export async function fetchHealth() {
  const res = await fetch(`${BASE_URL}/health`);
  return res.json();
}

export async function fetchDashboard() {
  const res = await fetch(`${BASE_URL}/dashboard`);
  return res.json();
}

export async function loadDemoData() {
  const res = await fetch(`${BASE_URL}/load-demo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  return res.json();
}

export async function uploadCSV(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: formData
  });
  return res.json();
}

export async function runSegmentation(nClusters = 4) {
  const res = await fetch(`${BASE_URL}/segment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ n_clusters: nClusters })
  });
  return res.json();
}

export async function fetchCustomers({ page = 1, pageSize = 10, search = '', segment = '', membership = '', location = '', sentiment = '' } = {}) {
  const params = new URLSearchParams({
    page,
    page_size: pageSize,
    search,
    segment,
    membership,
    location,
    sentiment
  });
  const res = await fetch(`${BASE_URL}/customers?${params.toString()}`);
  return res.json();
}

export async function fetchClusters() {
  const res = await fetch(`${BASE_URL}/clusters`);
  return res.json();
}

export async function fetchFeedback({ search = '', sentiment = '' } = {}) {
  const params = new URLSearchParams({ search, sentiment });
  const res = await fetch(`${BASE_URL}/feedback?${params.toString()}`);
  return res.json();
}

export async function predictCustomer(customerData) {
  const res = await fetch(`${BASE_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customerData)
  });
  return res.json();
}

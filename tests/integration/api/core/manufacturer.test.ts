import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { testApp } from '@tests/helpers/test-server';
import { setupTestDatabase, cleanupTestDatabase, cleanAllTables } from '@tests/helpers/test-database';
import { seedManufacturer, seedManufacturers } from '@tests/fixtures/test-data';
import { manufacturerFactory } from '@tests/fixtures/factories/manufacturer.factory';
import type { ManufacturerListResponse, ManufacturerResponse } from '@/schemas/core/manufacturer.schemas';

describe('Manufacturer API Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  }, 10000); // 10 second timeout for database setup

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    await cleanAllTables();
  });

  describe('GET /api/core/manufacturers', () => {
    it('should return empty list when no manufacturers exist', async () => {
      const response = await testApp.request('/api/core/manufacturers');
      
      expect(response.status).toBe(200);
      const data: ManufacturerListResponse = await response.json();
      expect(data.data).toEqual([]);
      expect(data.pagination).toMatchObject({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      });
    });

    it('should return paginated list of manufacturers', async () => {
      await seedManufacturers(5);
      
      const response = await testApp.request('/api/core/manufacturers?page=1&limit=3');
      
      expect(response.status).toBe(200);
      const data: ManufacturerListResponse = await response.json();
      expect(data.data).toHaveLength(3);
      expect(data.pagination).toMatchObject({
        page: 1,
        limit: 3,
        total: 5,
        totalPages: 2,
      });
    });

    it('should filter manufacturers by search query', async () => {
      await seedManufacturer({ name: 'Tesla', displayName: 'Tesla Inc.' });
      await seedManufacturer({ name: 'Toyota', displayName: 'Toyota Motor Corporation' });
      await seedManufacturer({ name: 'Ford', displayName: 'Ford Motor Company' });
      
      const response = await testApp.request('/api/core/manufacturers?search=Tesla');
      
      expect(response.status).toBe(200);
      const data: ManufacturerListResponse = await response.json();
      expect(data.data).toHaveLength(1);
      expect(data.data[0].name).toBe('Tesla');
    });

    it('should filter by active status', async () => {
      await seedManufacturer({ name: 'Active1', isActive: true });
      await seedManufacturer({ name: 'Active2', isActive: true });
      await seedManufacturer({ name: 'Inactive', isActive: false });
      
      const response = await testApp.request('/api/core/manufacturers?status=active');
      
      expect(response.status).toBe(200);
      const data: ManufacturerListResponse = await response.json();
      expect(data.data).toHaveLength(2);
      expect(data.data.every(m => m.isActive)).toBe(true);
    });

    it('should sort manufacturers by name', async () => {
      await seedManufacturer({ name: 'Zebra Motors' });
      await seedManufacturer({ name: 'Alpha Cars' });
      await seedManufacturer({ name: 'Beta Vehicles' });
      
      const response = await testApp.request('/api/core/manufacturers?sort=name&order=asc');
      
      expect(response.status).toBe(200);
      const data: ManufacturerListResponse = await response.json();
      expect(data.data[0].name).toBe('Alpha Cars');
      expect(data.data[1].name).toBe('Beta Vehicles');
      expect(data.data[2].name).toBe('Zebra Motors');
    });
  });

  describe('GET /api/core/manufacturers/:id', () => {
    it('should return manufacturer by public ID', async () => {
      const manufacturer = await seedManufacturer({ 
        name: 'Tesla',
        displayName: 'Tesla Inc.' 
      });
      
      const response = await testApp.request(`/api/core/manufacturers/${manufacturer.publicId}`);
      
      expect(response.status).toBe(200);
      const data: ManufacturerResponse = await response.json();
      expect(data.id).toBe(manufacturer.publicId);
      expect(data.name).toBe('Tesla');
      expect(data.displayName).toBe('Tesla Inc.');
    });

    it('should return 404 for non-existent manufacturer', async () => {
      const response = await testApp.request('/api/core/manufacturers/mfr_nonexistent');
      
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Manufacturer not found');
    });
  });

  describe('POST /api/core/manufacturers', () => {
    it('should create a new manufacturer', async () => {
      const input = manufacturerFactory.buildCreateInput({
        name: 'New Manufacturer',
        displayName: 'New Manufacturer Inc.',
        countryCode: 'US',
      });
      
      const response = await testApp.request('/api/core/manufacturers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      
      expect(response.status).toBe(201);
      const data: ManufacturerResponse = await response.json();
      expect(data.name).toBe('New Manufacturer');
      expect(data.displayName).toBe('New Manufacturer Inc.');
      expect(data.countryCode).toBe('US');
      expect(data.slug).toBe('new-manufacturer');
    });

    it('should reject duplicate manufacturer names', async () => {
      await seedManufacturer({ name: 'Existing Manufacturer' });
      
      const input = manufacturerFactory.buildCreateInput({
        name: 'Existing Manufacturer',
      });
      
      const response = await testApp.request('/api/core/manufacturers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Internal server error');
    });

    it('should validate required fields', async () => {
      const response = await testApp.request('/api/core/manufacturers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: 'Missing Name',
        }),
      });
      
      expect(response.status).toBe(500);
    });
  });

  describe('PUT /api/core/manufacturers/:id', () => {
    it('should update an existing manufacturer', async () => {
      const manufacturer = await seedManufacturer({
        name: 'Original Name',
        displayName: 'Original Display',
        description: 'Original description',
      });
      
      const updateData = {
        displayName: 'Updated Display Name',
        description: 'Updated description',
        countryCode: 'JP',
      };
      
      const response = await testApp.request(`/api/core/manufacturers/${manufacturer.publicId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      expect(response.status).toBe(200);
      const data: ManufacturerResponse = await response.json();
      expect(data.name).toBe('Original Name'); // Name should not change
      expect(data.displayName).toBe('Updated Display Name');
      expect(data.description).toBe('Updated description');
      expect(data.countryCode).toBe('JP');
    });

    it('should return 404 for non-existent manufacturer', async () => {
      const response = await testApp.request('/api/core/manufacturers/mfr_nonexistent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: 'New Name' }),
      });
      
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Manufacturer not found');
    });
  });

  describe('DELETE /api/core/manufacturers/:id', () => {
    it('should delete a manufacturer', async () => {
      const manufacturer = await seedManufacturer({ name: 'To Be Deleted' });
      
      const response = await testApp.request(`/api/core/manufacturers/${manufacturer.publicId}`, {
        method: 'DELETE',
      });
      
      expect(response.status).toBe(204);
      
      // Verify manufacturer is deleted
      const getResponse = await testApp.request(`/api/core/manufacturers/${manufacturer.publicId}`);
      expect(getResponse.status).toBe(404);
    });

    it('should handle deletion of non-existent manufacturer', async () => {
      const response = await testApp.request('/api/core/manufacturers/mfr_nonexistent', {
        method: 'DELETE',
      });
      
      // Should still return 204 for idempotency
      expect(response.status).toBe(204);
    });
  });
});
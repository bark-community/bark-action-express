import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { donation_sol } from '../src/actions/donation_sol';
import { donation_usdc } from '../src/actions/donation_usdc';
import { donationBarkRouter } from '../src/actions/donation_bark';
import { mockData } from '../src/mock/mockData';

const app = express();
app.use(bodyParser.json());
app.use('/donate-sol', donation_sol);
app.use('/donate-usdc', donation_usdc);
app.use('/donate-bark', donationBarkRouter);

describe('API Endpoints', function() {
    describe('GET /donate-sol-config', function() {
        it('should return a 200 status and correct configuration', async function() {
            const response = await request(app).get('/donate-sol/donate-sol-config');
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject(mockData.donationSolConfig);
        });
    });

    describe('POST /donate-sol-build', function() {
        it('should handle donation transactions', async function() {
            const response = await request(app)
                .post('/donate-sol/donate-sol-build')
                .send({ account: 'user-wallet-address' }) // Replace with a valid test wallet address
                .query({ amount: 1.0 }); // Query parameters

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Successfully sent 1 SOL! Thank you for your donation.');
        });
    });

    describe('GET /donate-usdc-config', function() {
        it('should return a 200 status and correct configuration', async function() {
            const response = await request(app).get('/donate-usdc/donate-usdc-config');
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject(mockData.donationUsdcConfig);
        });
    });

    describe('POST /donate-usdc-build', function() {
        it('should handle USDC donation transactions', async function() {
            const response = await request(app)
                .post('/donate-usdc/donate-usdc-build')
                .send({ account: 'user-wallet-address' }) // Replace with a valid test wallet address
                .query({ amount: 100 }); // Query parameters

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Successfully sent 100 USDC! Thank you for your donation.');
        });
    });

    describe('GET /donate-bark-config', function() {
        it('should return a 200 status and correct configuration', async function() {
            const response = await request(app).get('/donate-bark/donate-bark-config');
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject(mockData.donationBarkConfig);
        });
    });

    describe('POST /donate-bark-build', function() {
        it('should handle BARK donation transactions', async function() {
            const response = await request(app)
                .post('/donate-bark/donate-bark-build')
                .send({ account: 'user-wallet-address' }) // Replace with a valid test wallet address
                .query({ amount: 100 }); // Query parameters

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Successfully sent 100 BARK! Thank you for your donation.');
        });
    });
});

import request from 'supertest';
import jwt from 'jsonwebtoken';

import { jest } from '@jest/globals';

jest.unstable_mockModule('./db.js', () => ({
    register_user: jest.fn(),
    get_user: jest.fn(),
    insert_hazard: jest.fn(),
    get_heatmap_data: jest.fn(),
    get_chat_messages: jest.fn(),
    send_messages: jest.fn(),
    check_voted: jest.fn(),
    increment_vote: jest.fn(),
    decrement_vote: jest.fn(),
    insert_vote: jest.fn(),
    delete_vote: jest.fn(),
    get_all_hazards: jest.fn(),
    get_hazard_by_id: jest.fn(),
    get_hazard_full: jest.fn(),
    update_hazard: jest.fn(),
    log_status_update: jest.fn(),
    delete_hazard: jest.fn(),
    get_my_reports: jest.fn(),
    get_notifications: jest.fn(),
    insert_notification: jest.fn(),
    get_hazard_reporter: jest.fn(),
    get_message_author: jest.fn(),
    get_hazard_from_message: jest.fn()
}));

const { default: app } = await import('./server.js');
const db = await import('./db.js');


const makeToken = (role = 'resident', id = 1) =>
    jwt.sign({ id, role }, process.env.JWT_SECRET || 'testsecret', { expiresIn: '2h' });


//registering tests

describe('POST /register', () => {

    beforeEach(() => {
    jest.clearAllMocks();
    });

    test('valid email and password', async () => {
        db.register_user.mockResolvedValue({rows: []});
        const res = await request(app).post('/register').send({email: 'test@test.com', password: 'passord'});
        expect(res.status).toBe(201);
    });
    test('invalid email', async () => {
        db.register_user.mockRejectedValue(new Error ('invalid email'));
        const res = await request(app).post('/register').send({email: 'incorrect', password: 'passord'});
        expect(res.status).toBe(500);
    });
    test('duplicate emails', async () => {
        db.register_user.mockRejectedValue(new Error ('Database Error: duplicate key value violates unique constraint "users_email_key"'));
        const res = await request(app).post('/register').send({email: 'existing@email.com', password: 'passord'});
        expect(res.status).toBe(500);
    });
});

//login tests

describe('POST /login', () => { //cant do success because it doesnt return a status

    beforeEach(() => {
    jest.clearAllMocks();
    });

    test('no inputs', async () => {
        db.get_user.mockResolvedValue({ rows: [] });
        const res = await request(app).post('/login').send({});
        expect(res.status).toBe(401);
    });

    test('unregistered email', async () => {
        db.get_user.mockResolvedValue({ rows: [] });
        const res = await request(app).post('/login').send({ email: 'unregistered@test.com', password: 'passord' });
        expect(res.status).toBe(401);
    });

    test('wrong password', async () => {
        db.get_user.mockResolvedValue({
            rows: [{ id: 1, email: 'test@test.com', password_hash: 'wrong', role: 'resident' }]
        });
        const res = await request(app).post('/login').send({ email: 'test@test.com', password: 'wrongpassword' });
        expect(res.status).toBe(401);
    });
});

//report tests

describe('POST /report-hazard', () => { //invalid inputs handled on frontend
    const token = makeToken();

    test('all valid inputs', async () => {
        db.insert_hazard.mockResolvedValue({
            rows: [{ id: 1, category: 'Safety Hazard', severity: 3 }]
        });
        const res = await request(app).post('/report-hazard').set('Authorization', `Bearer ${token}`)
            .field('reporter_user_id', '1')
            .field('hazard_category', 'Safety Hazard')
            .field('severity', '3')
            .field('description', 'test')
            .field('latitude', '52.4506')
            .field('longitude', '-1.9306');

        expect(res.status).toBe(201);
    });

    test('attempt to report as guest', async () => {
        const res = await request(app).post('/report-hazard').field('hazard_category', 'Safety Hazard');
        expect([401,403]).toContain(res.status);
    });

});
//heatmap tests

describe('GET /heatmap-data', () => {

    test('no time range', async () => {
        db.get_heatmap_data.mockResolvedValue({
            rows: [{ id: 1, latitude: '52.4506', longitude: '-1.9306', category: 'Safety Hazard', description: 'test', status: 'Reported', severity: 3, location_name: 'test', image_url: null }]
        });
        const res = await request(app).get('/heatmap-data');
        expect(res.status).toBe(200);
        expect(res.body[0]).toHaveProperty('lat');
        expect(res.body[0]).toHaveProperty('lng');
    });

    test('time range', async () => {
        db.get_heatmap_data.mockResolvedValue({ rows: [] });
        const res = await request(app)
            .get('/heatmap-data')
            .query({ start_time: '2024-01-01', end_time: '2024-12-31' });
        expect(res.status).toBe(200);
        expect(db.get_heatmap_data).toHaveBeenCalledWith('2024-01-01', '2024-12-31');
    });
});

//message tests

describe('POST /send-messages', () => {
    const token = makeToken();

    test('valid message', async () => {
        db.send_messages.mockResolvedValue({ rows: [{ message_id: 1, message: 'hello' }] });
        db.get_hazard_reporter.mockResolvedValue({ rows: [{ reporter_user_id: 2 }] });
        db.insert_notification.mockResolvedValue({ rows: [] });
        const res = await request(app).post('/send-messages').set('Authorization', `Bearer ${token}`).send({ user_id: 1, hazard_id: 1, message: 'Hello' });
        expect(res.status).toBe(201);
    });

    test('censorship', async () => {
        db.send_messages.mockResolvedValue({ rows: [{ message_id: 2, message: '****' }] });
        db.get_hazard_reporter.mockResolvedValue({ rows: [] });
        const res = await request(app).post('/send-messages').set('Authorization', `Bearer ${token}`).send({ user_id: 1, hazard_id: 1, message: 'fuck' });
        expect(res.status).toBe(201);
        expect(db.send_messages).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            expect.not.stringContaining('fuck')
        );
    });

});

describe('POST /update-vote', () => {
    const token = makeToken();

    test('add a vote ', async () => {
        db.check_voted.mockResolvedValue({ rows: [] });
        db.increment_vote.mockResolvedValue({ rows: [{ message_id: 1, vote: 2 }] });
        db.insert_vote.mockResolvedValue({ rows: [{ message_id: 1, user_id: 1 }] });
        db.get_message_author.mockResolvedValue({ rows: [{ user_id: 2, message: 'hello' }] });
        db.insert_notification.mockResolvedValue({ rows: [] });
        db.get_hazard_from_message.mockResolvedValue({ rows: [{ hazard_id: 1 }] });
        const res = await request(app).post('/update-vote').set('Authorization', `Bearer ${token}`).send({ message_id: 1, user_id: 1 });
        console.log(res.body, res.text);
        expect(res.status).toBe(200);
        expect(res.body.action).toBe('added');
    });

    test('remove a vote', async () => {
        db.check_voted.mockResolvedValue({ rows: [{ message_id: 1, user_id: 1 }] });
        db.decrement_vote.mockResolvedValue({ rows: [{ message_id: 1, vote: 0 }] });
        db.delete_vote.mockResolvedValue({ rows: [{ message_id: 1, user_id: 1 }] });
        const res = await request(app).post('/update-vote').set('Authorization', `Bearer ${token}`).send({ message_id: 1, user_id: 1 });
        expect(res.status).toBe(200);
        expect(res.body.action).toBe('removed');
    });
});

//staff tests

describe('PUT /admin/update-hazard/:id', () => {
    const token = makeToken('staff');

    test('updates all fields', async () => {
        db.get_hazard_by_id.mockResolvedValue({
            rows: [{ status: 'Reported', reporter_user_id: 2, description: 'prev' }]
        });
        db.update_hazard.mockResolvedValue({ rows: [] });
        db.log_status_update.mockResolvedValue({ rows: [] });
        db.insert_notification.mockResolvedValue({ rows: [] });
        const res = await request(app).put('/admin/update-hazard/1').set('Authorization', `Bearer ${token}`).send({ status: 'Fixed', description: 'test', severity: 1, note: 'testnote' });
        expect(res.status).toBe(200);
    });

    test('non-existant hazard', async () => {
        db.get_hazard_by_id.mockResolvedValue({ rows: [] });
        const res = await request(app).put('/admin/update-hazard/999').set('Authorization', `Bearer ${token}`).send({ status: 'Fixed', description: 'test', severity: 1 });
        expect(res.status).toBe(404);
    });

    test('attempt delete not as staff', async () => {
        const res = await request(app).put('/admin/update-hazard/1').send({ status: 'Fixed' });
        expect(res.status).toBeGreaterThanOrEqual(401);
    });
});

describe('DELETE /admin/delete-hazard/:id', () => {
    const token = makeToken('staff');

    test('delete hazard', async () => {
        db.delete_hazard.mockResolvedValue({ rows: [] });
        const res = await request(app).delete('/admin/delete-hazard/1').set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
    });

});

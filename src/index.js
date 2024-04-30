import { browser } from 'k6/experimental/browser';
import { describe, expect } from 'https://jslib.k6.io/k6chaijs/4.3.4.3/index.js';

import { faker } from '@faker-js/faker/locale/en_US';

const generateTestData = () => ({
    endCoverageDate: faker.date.future().toISOString().split('T')[0],
    value: faker.finance.amount({ min: 500, max: 5000, dec: 0 }),
    name: faker.person.fullName(),
    cpf: faker.helpers.replaceSymbols('###########'),
    email: faker.internet.email(),
    vehicleBrand: faker.vehicle.manufacturer(),
    vehicleModel: faker.vehicle.model(),
    vehicleYear: faker.date.past({ years: 20 }).getFullYear().toString(),
    vehiclePlate: faker.string.alphanumeric({ count: 7 }).toUpperCase()
});

export const options = {
    cloud: {
        projectID: 3694185,
        name: 'Test Insurance Login'
    },
    scenarios: {
        browser: {          
            executor: 'per-vu-iterations',
            vus: 60,
            iterations: 1,
            maxDuration: '30s',
            options: {
                browser: {
                    type: 'chromium',
                },
            },
        }
    },
}

export default async function() {
    const testData = generateTestData();
    const page = browser.newPage();
    await page.goto('http://localhost:3000/');
    const emailInput = page.locator('input[name=email]');
    const passwordInput = page.locator('input[name=password]');
    const submitButton = page.locator('button[class=login-button]');
    emailInput.fill('gustavoalberttodev@gmail.com')
    passwordInput.fill('123456')
    submitButton.click()
    await page.waitForNavigation()

    describe('User logs in with email and password sucessfully and get redirected to the homepage', async () => {
        expect(page.url()).to.equal('http://localhost:3000/')
    })

    const newPolicyLink = page.locator('a[class=new-policy-link]');
    newPolicyLink.click()
    await page.waitForNavigation()

    describe('User access the new policy page', async () => {
        expect(page.url()).to.equal('http://localhost:3000/policies/new')
    })

    describe('User creates a new policy', async () => {
        const endCoverageInput = page.locator('input[name=end-date]');
        const valueInput = page.locator('input[name=prize-value]');
        const nameInput = page.locator('input[name=full-name]');
        const cpfInput = page.locator('input[name=cpf]');
        const emailInput = page.locator('input[name=email]');
        const vehicleBrandInput = page.locator('input[name=car-brand]');
        const vehicleModelInput = page.locator('input[name=car-model]');
        const vehicleYearInput = page.locator('input[name=car-year]');
        const vehiclePlateInput = page.locator('input[name=car-plate]');
        const submitButton = page.locator('button[class=submit-button]');

        endCoverageInput.fill(testData.endCoverageDate);
        valueInput.fill(testData.value);
        nameInput.fill(testData.name);
        cpfInput.fill(testData.cpf);
        emailInput.fill(testData.email);
        vehicleBrandInput.fill(testData.vehicleBrand);
        vehicleModelInput.fill(testData.vehicleModel);
        vehicleYearInput.fill(testData.vehicleYear);
        vehiclePlateInput.fill(testData.vehiclePlate);
        console.log(testData.vehiclePlate)
        submitButton.click()

        await page.waitForNavigation()
        expect(page.url()).to.equal('http://localhost:3000/')
    })
}
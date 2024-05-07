import { browser } from 'k6/experimental/browser';
import { group, check } from 'k6';

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
    vehiclePlate: faker.string.alphanumeric(7).toUpperCase()
});

const NUMBER_OF_VUS = 30;

export const options = {
    cloud: {
        projectID: 3694185,
        name: 'Test Insurance Login'
    },
    scenarios: {
        create_policy_test: {          
            executor: 'per-vu-iterations',
            vus: NUMBER_OF_VUS,
            iterations: 1,
            maxDuration: '30s',
            options: {
                browser: {
                    type: 'chromium',
                },
            },
            tags: { type: 'loadtest' },
        }
    },
}

export default async function() {
    const test_data = generateTestData(); 
    const page = browser.newPage();
    await page.goto('http://localhost:3000/');
    const emailInput = page.locator('input[name=email]');
    const passwordInput = page.locator('input[name=password]');
    const submitButton = page.locator('button[class=login-button]');
    emailInput.fill('gustavoalberttodev@gmail.com');
    passwordInput.fill('123456');
    submitButton.click();
    await page.waitForNavigation();

    group('User solicitates a policy creation sucessfully', async () => {
        await page.goto('http://localhost:3000/policies/new');
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

        endCoverageInput.fill(test_data.endCoverageDate);
        valueInput.fill(test_data.value);
        nameInput.fill(test_data.name);
        cpfInput.fill(test_data.cpf);
        emailInput.fill(test_data.email);
        vehicleBrandInput.fill(test_data.vehicleBrand);
        vehicleModelInput.fill(test_data.vehicleModel);
        vehicleYearInput.fill(test_data.vehicleYear);
        vehiclePlateInput.fill(test_data.vehiclePlate);

        submitButton.click();
        await page.waitForNavigation();
        const notificationText = page.waitForSelector('div.solicitation-success').textContent();
        page.close();
        check(notificationText, {
            'Solicitation notification is visible': (text) => text.includes('Solicitação de Apólice realizado com sucesso!')
        });
    });
}
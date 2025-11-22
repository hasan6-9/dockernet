// tests/frontend/scenarios.test.js
describe("Complete Junior Doctor Registration", () => {
  it("Should register and complete profile", () => {
    cy.visit("http://localhost:3000/register");

    // Registration form
    cy.get('input[name="firstName"]').type("Dr. Test");
    cy.get('input[name="lastName"]').type("User");
    cy.get('input[name="email"]').type(`testuser${Date.now()}@test.com`);
    cy.get('input[name="phone"]').type("555-1234");
    cy.get('select[name="role"]').select("junior");
    cy.get('input[name="password"]').type("TestPass123!");
    cy.get('input[name="confirmPassword"]').type("TestPass123!");
    cy.get('input[name="medicalLicenseNumber"]').type("ML-TEST-001");
    cy.get('select[name="licenseState"]').select("CA");
    cy.get('input[name="primarySpecialty"]').type("Cardiology");
    cy.get('input[name="yearsOfExperience"]').type("3");
    cy.get('input[name="medicalSchool.name"]').type("Test Medical");
    cy.get('input[name="medicalSchool.graduationYear"]').type("2020");
    cy.get('input[name="location.city"]').type("San Francisco");
    cy.get('input[name="location.state"]').type("CA");

    cy.get('button:contains("Register")').click();
    cy.url().should("include", "/login");
    cy.contains("Registration successful").should("be.visible");
  });
});

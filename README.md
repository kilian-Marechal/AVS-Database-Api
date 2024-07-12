# AVS-Database-Api

[TEMPLATE]
{project description}

# Run the project

1. Setup the `.env` and `.env.development` files by duplicating the `.env.example` and `.env.development.example` files and filling the correct values
2. Install the required packages with the command `yarn`
3. Start the serverless function with `yarn dev`
4. Make a POST request to [http://localhost:3000/dev-v{version_number}/postEndpoint](http://localhost:3000/dev-v{version_number}/postEndpoint)

# Tests

-- Tests are done in two ways: mocked or live

-- Mocked tests are done by mocking any function in **test**/config/mocks and using the said mocks in **test**/config/jestSetup.ts.
Your mocked tests are in the **test**/tests/mocked

-- Live tests will probably not require any further configuration, apart from specifying in your test to unmock the functions used which is done as follows : jest.unmock('@/core/{pathToYourFunction}').
Live tests are at the root of **test**/tests/

# Deployments

[TEMPLATE]
| Stage      |              Link              |
| ---------- | :----------------------------: |
| Staging    | [{staging_url}]({staging_url}) |
| Production |      [prod_url](prod_url)      |
